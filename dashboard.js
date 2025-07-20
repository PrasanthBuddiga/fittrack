
import { getLogByDay } from "./foodJS.js";
let totalCalories=0;
  let totalProtein=0;
  let totalCarbs=0;
  let totalFats=0;
export async function renderDashboard(contentDiv) {
  // const macroCalc = getMacroHTML();
  const dayLog=await getCurrentDaysLog();
  
   totalCalories=0;
   totalProtein=0;
   totalCarbs=0;
   totalFats=0;
  const dashboardContent = `
    <div class='dash-grid'>
      <div class='dash weight-tracker'>
        <h4>Weight Data</h4>
        <div class='chart-grid1'>
          <canvas id="weightGauge" ></canvas>
          <p id='quote'>Progress is progress, no matter how small. Keep grinding, you are almost there!</p>
        </div>
      </div>
      <div class='dash'>
        <h4>Today's Macros</h4>
        <div class='chart-grid'>
          <canvas id="nutrientTrack"></canvas> 
        </div>
      </div>
      <div class='dash'>
        <h4>Calorie Intake</h4>
        <div class='chart-grid'>
        <div id="calorie-Track"></div>
        </div>
      </div>
      
      <div class='dash'>
       <div class='locked'>
       <span class="material-icons lock-icon">lock</span>
        <p class="lock-msg">Subscribe to unlock premium featues</p>
       </div>
      </div>
      <div class='dash wide-dash'>
       <h4>Weekly Calories</h4>
       <canvas id="weeklyCalorieChart" height="200"></canvas>
       <div class='locked'> 
        <span class="material-icons lock-icon">lock</span>
        <p class="lock-msg">Subscribe to unlock premium featues</p>
       </div>
      </div>
      
      
    </div>
  `;
contentDiv.innerHTML=dashboardContent;
 dayLog.dayLog?.foodLog?.forEach(element => {
    totalCalories+=Number(element.calories);
    totalCarbs+=Number(element.carbs);
    totalFats+=Number(element.fats);
    totalProtein+=Number(element.protein);
  });
loadWeightTracker();
      // loadNutrientProgress();
      renderMacroChart();
      loadCalorieTracker();
      renderWeeklyCaloriesChart();
     
  console.log(totalCalories,totalCarbs,totalFats,totalProtein);
}

export function loadWeightTracker(){
const userInfo=JSON.parse(localStorage.getItem('user'));
const currentWeight = userInfo.weight; 
const targetWeight = userInfo.targetWeight;;
const maxWeight = 85;

const progressValue = currentWeight - targetWeight;
const totalRange = maxWeight - targetWeight;
const progressPercent = Math.min(100, (progressValue / totalRange) * 100);

const canvas = document.getElementById('weightGauge');
const ctx = canvas.getContext('2d');

const weightChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    datasets: [{
      data: [progressPercent, 100 - progressPercent],
      backgroundColor: ['#347928', '#FCCD2A'],
      borderWidth: 0,
      borderRadius: 8,
      cutout: '65%',
      circumference: 180,
      rotation: -90,
    }]
  },
  options: {
    responsive: false,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
      title: { display: false }
    }
  },
  plugins: [{
    id: 'customCenterText',
    beforeDraw(chart) {
      const { width } = chart;
      const { ctx } = chart; // ✅ This is scoped correctly

      const centerX = chart.chartArea.left + chart.chartArea.width / 2;
      const centerY = chart.chartArea.top + chart.chartArea.height / 1.6; // adjust for lower position

      ctx.save();
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${currentWeight} kg`, centerX, centerY);
      ctx.restore();
    }
  }]
});



}
export function loadNutrientProgress(){
    const radialCont = document.querySelector("#nutrientTrack");

  if (radialCont) {
    const protein='70';
    const fats='80';
    const carbs='90';

    const options = {
          series: [protein,fats,carbs],
          chart: {
          height: 180,
          type: 'radialBar',
        },
        plotOptions: {
          radialBar: {
            dataLabels: {
              name: {
                fontSize: '0.8rem',
              },
              value: {
                fontSize: '0.8rem',
              },
              total: {
                show: true,
                fontSize:'0.8rem',
                label: 'Nutrients',
                formatter: function (w) {
                  return ''
                }
              }
            }
          }
        },
        fill: {
        colors: ['#347928','#FCCD2A','#C0EBA6']
      },
        labels: ['Protein','Fat','Carbohydrate'],
        };
        const chart = new ApexCharts(radialCont, options);
        chart.render();
}

}

export function loadCalorieTracker(){

  const userInfo=JSON.parse(localStorage.getItem('user'));

  const chartCont = document.querySelector("#calorie-Track");
  const calorieValue = totalCalories;  // Actual calorie intake
  const targetCalories=userInfo.targetCalories;
const percentFilled = ((totalCalories/targetCalories)*100).toFixed(2);
console.log("Percentage", percentFilled)

const options = {
  series: [percentFilled],
  chart: {
    height: 200,
    type: 'radialBar',
  },
  plotOptions: {
    radialBar: {
      hollow: {
        size: '70%',
      },
      track: {
        strokeWidth: '100%',
        background: '#C0EBA6',
      },
      dataLabels: {
        name: {
          fontSize: '1 rem',
          show:false
        },
        value: {
          fontSize: '0.8rem',
          formatter: function () {
            return `${calorieValue} / ${targetCalories} kcal`;  // Show actual calorie value
          }
        },
      }
    }
  },
  stroke: {
    lineCap: 'round'  // Simulates border-radius
  },
  fill: {
    colors: ['#347928']
  },
  labels: ['Calories'],
};

const chart = new ApexCharts(chartCont, options);
chart.render();

}

export function renderMacroChart1() {
  const userInfo=JSON.parse(localStorage.getItem('user'));
  
  const macroData = {
    labels: ['Protein', 'Carbs', 'Fats'],
    current: [totalProtein, totalCarbs, totalFats],  // Current intake
    goal: [0, 0, 80]     // Daily goal
  };

  // Calculate progress %
  const progress = macroData.current.map((val, i) =>
    Math.min((val / macroData.goal[i]) * 100, 100)
  );

  // Custom labels for inside bars
  const labelText = macroData.current.map((val, i) => `${val}g / ${macroData.goal[i]}g`);

  const options = {
    chart: {
      type: 'bar',
      height: '100%',
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 700
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        borderRadius: 8,
        distributed: true,
        dataLabels: {
          position: 'left' // Set to left, we'll control offset manually
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (_, opts) {
        return labelText[opts.dataPointIndex];
      },
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#000']
      },
      offsetX: 10, // Push labels slightly right
    },
    xaxis: {
      categories: macroData.labels,
      max: 100,
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    colors: ['#347928', '#FCCD2A', '#C0EBA6'],
    series: [{
      name: 'Progress',
      data: progress
    }],
    tooltip: {
      y: {
        formatter: function (val, opts) {
          const i = opts.dataPointIndex;
          return `${macroData.current[i]}g of ${macroData.goal[i]}g`;
        }
      }
    },
    legend: { show: false }
  };

  const chart = new ApexCharts(document.querySelector("#nutrientTrack"), options);
  chart.render();
  window.addEventListener('resize', () => {
  chart.resize();
});
}
export function renderWeeklyCaloriesChart() {
  const ctx = document.getElementById('weeklyCalorieChart').getContext('2d');

  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Calories Consumed',
      data: [2100, 2300, 1800, 2500, 1900, 2200, 2000], // sample data
      borderColor: '#48A343',
      backgroundColor: 'rgba(72, 163, 67, 0.1)',
      tension: 0.4, // smooth curves
      pointRadius: 5,
      pointHoverRadius: 7,
      fill: true
    }]
  };

  const config = {
    type: 'line',
    data: weeklyData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: context => `${context.parsed.y} kcal`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: false,
            text: 'Calories'
          }
        },
        x: {
          title: {
            display: false,
            text: 'Day'
          }
        }
      }
    }
  };

  new Chart(ctx, config);
}
export function renderMacroChart() {
  const ctx = document.getElementById('nutrientTrack').getContext('2d');
   const userInfo=JSON.parse(localStorage.getItem('user'));
  

  const macroData = {
    labels: ['P', 'C', 'F'],
    current: [totalProtein, totalCarbs, totalFats],
    goal: [userInfo.targetProtein, userInfo.targetCarbs, userInfo.targetFat],
  };

  // Calculate progress %, capped at 100%
  const progress = macroData.current.map((val, i) =>
    Math.min((val / macroData.goal[i]) * 100, 100)
  );

  // Custom label text inside bars
  const labelText = macroData.current.map(
    (val, i) => `${val}g / ${macroData.goal[i]}g`
  );

  // Destroy existing chart if any to avoid duplicates (optional)
  if (window.macroChartInstance) {
    window.macroChartInstance.destroy();
  }

  window.macroChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: macroData.labels,
      datasets: [{
        label: 'Progress',
        data: progress,
        backgroundColor: ['#347928', '#FCCD2A', '#C0EBA6'],
        borderRadius: 1,
        barPercentage: 1,
        categoryPercentage: 0.6,
      }]
    },
    options: {
      indexAxis: 'y', // horizontal bars
      responsive: true,
      animation: {
        duration: 800,
        easing: 'easeInOutQuart',
      },
      scales: {
        x: {
          max: 100,
          display: false,
          grid: {
            display: false
          }
        },
        y: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 8,
              weight: '400'
            },
            color: '#333'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: ctx => {
              const i = ctx.dataIndex;
              return `${macroData.current[i]}g of ${macroData.goal[i]}g`;
            }
          }
        },
        datalabels: {
          // Show custom labels inside bars
          color: '#000',
          anchor: 'center',
          align: 'center',
          font: {
            weight: 'bold',
            size: 10,
          },
          formatter: (value, context) => labelText[context.dataIndex]
        }
      }
    },
    // plugins: [ChartDataLabels] // You'll need to include the ChartDataLabels plugin
  });
}
export function getCurrentDaysLog(){
const currentDateFormatted= new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    weekday: 'long'
  });
  const truncatedDate=currentDateFormatted.split("y,")[1].slice(1);
  return getLogByDay(truncatedDate);
}

