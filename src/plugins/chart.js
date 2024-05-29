import { Chart, Legend, Title, Tooltip, Filler } from 'chart.js'

Chart.register(Legend, Title, Tooltip, Filler)

Chart.defaults.plugins.title.display = true
