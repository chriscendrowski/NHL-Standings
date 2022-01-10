//make canvas global variable
const myChart = document.getElementById('myChart').getContext('2d');

chartIt();
createWestStandings();
createEastStandings();

//fill out standingsTable

//fetch and parse data from csv file pulled via python
async function getData() {
    const response = await fetch('teams_points_df_updated_12-27-21.csv');
    const data = await response.text();

    const xlabels = [];
    const ypoints = [];
    const teamColors = [];
    const teamWins = [];
    const teamLosses = [];
    const teamOTLosses = [];
    const teamPointsPerc = [];
    const teamConference = [];
    const teamDivision = [];
    const teamTotalPointsPace = [];

    const table = data.split('\n').slice(1);
    table.forEach(row => {
        const columns = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);   //regex to handle splits of column values that have commas - i.e. rgba team color values
        const team = columns[1];
        xlabels.push(team);
        const points = columns[10];
        ypoints.push(points);
        const colors = "rgba".concat(columns[columns.length - 1].replace(/"/g, ""));
        teamColors.push(colors);
        const wins = columns[26];
        teamWins.push(wins);
        const losses = columns[6];
        teamLosses.push(losses);
        const otLosses = columns[8];
        teamOTLosses.push(otLosses);
        const pointsPerc = columns[11];
        teamPointsPerc.push(pointsPerc);
        const conf = columns[columns.length - 3];
        teamConference.push(conf);
        const divis = columns[columns.length - 2];
        teamDivision.push(divis);
        const pointsPace = columns[columns.length - 4];
        teamTotalPointsPace.push(pointsPace);
    })
    return {xlabels, ypoints, teamColors, teamWins, teamLosses, teamOTLosses, teamPointsPerc, teamConference, teamDivision, teamTotalPointsPace};
}

//CREATE ORIGINAL CHART WITH ALL TEAMS
async function chartIt() {
    const chartData = await getData();

    window.pointsChart = new Chart(myChart, {
        type:'bar',
        data:{
            labels: chartData.xlabels,
            datasets:[{
                label:'Points',
                data: chartData.ypoints,
                backgroundColor:chartData.teamColors,
                borderWidth:1,
                borderColor:'#777',
                hoverBorderWidth:3,
                hoverBorderColor:'#000'
            }]
        },
        options:{
            indexAxis:'y',
            layout:{
                padding:{left:50,right:50,top:50,bottom:50}
            },
            scales:{
                x:{
                    title:{
                        display: true,
                        text: 'Points',
                        padding:{top: 10}
                    }
                }
            },
            plugins:{
                indexAxis:'y',
                title:{
                    display: true,
                    text:'NHL Teams 2021-22 Points'
                },
                legend:{
                    display: false
                },
                tooltip:{
                    callbacks: {
                        afterBody: function(tooltipItem, data) {
                            return( 'W: '+chartData.teamWins[tooltipItem[0].dataIndex]+'\n'+'L: '+chartData.teamLosses[tooltipItem[0].dataIndex]+'\n'+'OTL: '+chartData.teamOTLosses[tooltipItem[0].dataIndex]+'\n'+'Pts %: '+Math.round(((chartData.teamPointsPerc[tooltipItem[0].dataIndex])*100))+'%');
                        }

                    }
                }
            }
        }
    });
}

// CREATE FILTERED CHART
async function filterChart() {
    const conferenceSelected = document.querySelector('input[name="conference_filter"]:checked').value

    window.pointsChart.destroy();         //destroy existing chart

    const filterData = await getData();

    const filter_ypoints = [];
    const filter_xlabels = [];
    const filter_teamColors = [];
    const filter_teamWins = [];
    const filter_teamLosses = [];
    const filter_teamOTLosses = [];
    const filter_teamPointsPerc = [];

    if(conferenceSelected == "All"){            //recreate initial all teams chart
        chartIt();
    }
    else {
        for (var i = 0; i < filterData.teamConference.length; i++){
            if(filterData.teamConference[i] == conferenceSelected){
                filter_ypoints.push(filterData.ypoints[i]);
                filter_xlabels.push(filterData.xlabels[i]);
                filter_teamColors.push(filterData.teamColors[i]);
                filter_teamWins.push(filterData.teamWins[i]);
                filter_teamLosses.push(filterData.teamLosses[i]);
                filter_teamOTLosses.push(filterData.teamOTLosses[i]);
                filter_teamPointsPerc.push(filterData.teamPointsPerc[i]);
            }
        }

        window.pointsChart = new Chart(myChart, {
            type:'bar',
            data:{
                labels: filter_xlabels,
                datasets:[{
                    label:'Points',
                    data: filter_ypoints,
                    backgroundColor: filter_teamColors,
                    borderWidth:1,
                    borderColor:'#777',
                    hoverBorderWidth:3,
                    hoverBorderColor:'#000'
                }]
            },
            options:{
                indexAxis:'y',
                layout:{
                    padding:{left:50,right:50,top:50,bottom:50}
                },
                scales:{
                    x:{
                        title:{
                            display: true,
                            text: 'Points',
                            padding:{top: 10}
                        }
                    }
                },
                plugins:{
                    indexAxis:'y',
                    title:{
                        display: true,
                        text:'NHL Teams 2021-22 Points - '+conferenceSelected+' Conference'
                    },
                    legend:{
                        display: false
                    },
                    tooltip:{
                        callbacks: {
                            afterBody: function(tooltipItem, data) {
                                return( 'W: '+filter_teamWins[tooltipItem[0].dataIndex]+'\n'+'L: '+filter_teamLosses[tooltipItem[0].dataIndex]+'\n'+'OTL: '+filter_teamOTLosses[tooltipItem[0].dataIndex]+'\n'+'Pts %: '+Math.round(((filter_teamPointsPerc[tooltipItem[0].dataIndex])*100))+'%');
                            }

                        }
                    }
                }
            }
        });
    }
    return false;
}

//FILL IN STANDINGS TABLES

async function createWestStandings(){
    const table = document.getElementById("westStandings");
    const tableData = await getData();

    for(var i = 0; i < tableData.teamConference.length; i++){
        if(tableData.teamConference[i] == 'Western'){
            let row = table.insertRow();
            let teamName = row.insertCell(0);
            teamName.innerHTML = tableData.xlabels[i];
            let teamPoints = row.insertCell(1);
            teamPoints.innerHTML = tableData.ypoints[i];
            let teamPointsPace = row.insertCell(2);
            teamPointsPace.innerHTML = tableData.teamTotalPointsPace[i];
            let teamPointsPercentage = row.insertCell(3);
            teamPointsPercentage.innerHTML = Math.round(tableData.teamPointsPerc[i]*100)+'%';
        }
    }
}

async function createEastStandings(){
    const table = document.getElementById("eastStandings");
    const tableData = await getData();

    for(var i = 0; i < tableData.teamConference.length; i++){
        if(tableData.teamConference[i] == 'Eastern'){
            let row = table.insertRow();
            let teamName = row.insertCell(0);
            teamName.innerHTML = tableData.xlabels[i];
            let teamPoints = row.insertCell(1);
            teamPoints.innerHTML = tableData.ypoints[i];
            let teamPointsPace = row.insertCell(2);
            teamPointsPace.innerHTML = tableData.teamTotalPointsPace[i];
            let teamPointsPercentage = row.insertCell(3);
            teamPointsPercentage.innerHTML = Math.round(tableData.teamPointsPerc[i]*100)+'%';
        }

    }
}
