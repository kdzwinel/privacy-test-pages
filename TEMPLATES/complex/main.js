const startButton = document.querySelector('#start');
const downloadButton = document.querySelector('#download');

const testsDiv = document.querySelector('#tests');
const testsSummaryDiv = document.querySelector('#tests-summary');
const testsDetailsDiv = document.querySelector('#tests-details');

const tests = [
    {
        id: 'test-test',
        run: () => {
            // function returning either a value or a promise
            let resolve, reject;
            const promise = new Promise((res, rej) => {resolve = res; reject = rej});

            setTimeout(() => resolve('ok'), 1000);

            return promise;
        }
    }
];

// object that contains results of all tests
const results = {
    page: 'name-of-the-test',// FILL ME OUT!
    date: null,
    results: []
};

function resultToHTML(data) {
    if (Array.isArray(data)) {
        return `<ul>${data.map(r => `<li>${r.test} - ${r.result}</li>`).join('')}</ul>`;
    } else if (data) {
        return JSON.stringify(data, null, 2);
    }

    return null;
}

/**
 * Test runner
 */
function runTests() {
    startButton.setAttribute('disabled', 'disabled');
    downloadButton.removeAttribute('disabled');
    testsDiv.removeAttribute('hidden');

    results.results.length = 0;
    results.date = (new Date()).toUTCString();
    let all = 0;
    let failed = 0;

    testsDetailsDiv.innerHTML = '';

    function updateSummary() {
        testsSummaryDiv.innerText = `Performed ${all} tests${failed > 0 ? ` (${failed} failed)` : ''}. Click for details.`;
    }

    for (const test of tests) {
        const resultObj = {
            id: test.id,
            value: null
        };
        results.results.push(resultObj);

        const li = document.createElement('li');
        li.id = `test-${test.id.replace(' ', '-')}`;
        li.innerHTML = `${test.id} - <span class='value'>…</span>`;
        const valueSpan = li.querySelector('.value');

        testsDetailsDiv.appendChild(li);

        try {
            const result = test.run();

            if (result instanceof Promise) {
                result
                    .then(data => {
                        valueSpan.innerHTML = resultToHTML(data);
                        resultObj.value = data || null;
                    })
                    .catch(e => {
                        failed++;
                        valueSpan.innerHTML = `❌ error thrown ("${e.message ? e.message : e}")`;
                        updateSummary();
                    });
            } else {
                valueSpan.innerHTML = resultToHTML(data);;
                resultObj.value = result || null;
            }
        } catch(e) {
            failed++;
            valueSpan.innerHTML = `❌ error thrown ("${e.message ? e.message : e}")`;
        }

        all++;
    }

    updateSummary();

    startButton.removeAttribute('disabled');
}

function downloadTheResults() {
    const data = JSON.stringify(results, null, 2);
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(new Blob([data], {type: 'application/json'}));
    a.href = url;
    a.download = 'fingerprinting-results.json';
    
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    a.remove();
}

downloadButton.addEventListener('click', () => downloadTheResults());

// run tests if button was clicked or…
startButton.addEventListener('click', () => runTests());

// if url query is '?run'
if (document.location.search === '?run') {
    runTests();
}
