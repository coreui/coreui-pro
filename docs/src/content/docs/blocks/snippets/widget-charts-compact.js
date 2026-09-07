new Chart(document.getElementById('blockChart7'), {
  type: 'bar',
  data: {
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S', 'M'],
    datasets: [
      {
        backgroundColor: '#321fdb',
        borderColor: 'transparent',
        borderWidth: 1,
        data: [41, 78, 51, 66, 74, 42, 89, 97, 87, 84, 78, 88, 67, 45, 47]
      }
    ]
  },
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        display: false
      }
    }
  }
})

new Chart(document.getElementById('blockChart8'), {
  type: 'line',
  data: {
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S', 'M'],
    datasets: [
      {
        backgroundColor: 'transparent',
        borderColor: '#321fdb',
        borderWidth: 2,
        data: [41, 78, 51, 66, 74, 42, 89, 97, 87, 84, 78, 88, 67, 45, 47]
      }
    ]
  },
  options: {
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 0
      }
    },
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        display: false
      }
    }
  }
})
