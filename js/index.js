function homeScene() {
    clearChart();
}

function initData() {
    initVisualization();
}

function initVisualization() {
    document.getElementById("bh").style.visibility = 'visible';
    document.getElementById("bh").innerHTML = "Home";
    nextScene(0);
    d3.select("#sourceDivId").html("<p>*Original data source: <a href='https://flunky.github.io/cars2017.csv'>https://flunky.github.io/cars2017.csv</a></p>");
}

function nextScene(clickId) {
    clearChart();
    updateVenue();
    scene('BMW');

}

function clearChart() {
    document.getElementById("scatterDivId").innerHTML = "";
}

function updateVenue() {
    d3.csv("data/cars2017.csv", function (error, data) {
        const makeMap = new Map()
        data.forEach(data => {
            const currentMake = data.Make;
            if (!makeMap.has(currentMake)) {
                makeMap.set(currentMake, new Array())
            }
            makeList = makeMap.get(currentMake);
            makeList.push(data)
            makeMap.set(currentMake, makeList)
        })

        const container = document.getElementById('makeDivId');
        for (key of makeMap) {
            const MakeLink = document.createElement('a');
            MakeLink.href = 'javascript:void(0);'; // 不跳转
            MakeLink.className = 'make';
            MakeLink.textContent = key[0];
            MakeLink.style.backgroundColor = '#007BFF';
            MakeLink.style.font.color = '#FFFFFF';
            MakeLink.style.border = 'none';
            MakeLink.addEventListener('click', (function (k) {
                return function () {
                    // alert(`You clicked on year: ${k}`);
                    scene(k)
                };
            })(key[0]));
            container.appendChild(MakeLink);
        }
    })

}
