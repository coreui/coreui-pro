/* eslint-disable unicorn/prefer-top-level-await */
/* global coreui: false */

// js-docs-start calendar-customize-cells
const myCalendarCustomizeCells = document.getElementById('myCalendarCustomizeCells')

// Pricing data caches
const pricingData = {} // For day prices
const monthRangeData = {} // For month min/max ranges
const yearRangeData = {} // For year min/max ranges

// Fetch pricing data for a specific date range and view
const fetchPricingData = async (startDate, endDate, view = 'days', limit = 400) => {
  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  try {
    const response = await fetch(`https://apitest.coreui.io/demos/daily-rates.php?start_date=${startDateStr}&end_date=${endDateStr}&view=${view}&limit=${limit}`)
    const data = await response.json()

    // API now returns object with date keys, merge directly into appropriate cache
    switch (view) {
      case 'days': {
        Object.assign(pricingData, data)
        break
      }

      case 'months': {
        Object.assign(monthRangeData, data)
        break
      }

      case 'years': {
        Object.assign(yearRangeData, data)
        break
      }

      default: {
        break
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching pricing data:', error)
  }
}

// Get min/max prices for a specific month from cached API data
const getMonthPriceRange = (year, month) => {
  // Format: YYYY-MM-01
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}-01`
  return monthRangeData[monthKey] || null
}

// Get min/max prices for a specific year from cached API data
const getYearPriceRange = year => {
  // Format: YYYY-01-01
  const yearKey = `${year}-01-01`
  return yearRangeData[yearKey] || null
}

// Helper to get date range based on view
const getDateRangeForView = (date, view) => {
  switch (view) {
    case 'days': {
      return {
        startDate: new Date(date.getFullYear(), date.getMonth(), 1),
        endDate: new Date(date.getFullYear(), date.getMonth() + 2, 0)
      }
    }

    case 'months': {
      return {
        startDate: new Date(date.getFullYear(), 0, 1),
        endDate: new Date(date.getFullYear(), 11, 31)
      }
    }

    case 'years': {
      const startYear = Math.floor(date.getFullYear() / 12) * 12
      return {
        startDate: new Date(startYear, 0, 1),
        endDate: new Date(startYear + 11, 11, 31)
      }
    }

    default: {
      return null
    }
  }
}

const myDefaultAllowList = coreui.Calendar.Default.allowList
myDefaultAllowList.div.push('style')

// Initialize calendar with data
const initCalendar = async () => {
  const initialDate = new Date(2025, 0, 1)
  const dateRange = getDateRangeForView(initialDate, 'days')

  // Fetch initial data
  await fetchPricingData(dateRange.startDate, dateRange.endDate, 'days')

  const calendar = new coreui.Calendar(myCalendarCustomizeCells, {
    calendars: 2,
    calendarDate: initialDate,
    locale: 'en-US',
    minDate: new Date(2022, 0, 1),
    maxDate: new Date(2025, 11, 31),
    range: true,
    renderDayCell(date, meta) {
      const dateKey = date.toISOString().split('T')[0]
      const price = pricingData[dateKey]

      return `<div class="py-1">
        <div>${date.toLocaleDateString('en-US', { day: '2-digit' })}</div>
        <div class="${meta.isSelected ? 'text-reset' : `text-body-tertiary${meta.isInCurrentMonth ? '' : ' opacity-75'}`}" style="font-size: 0.75rem;">${price ? `$${price}` : '-'}</div>
      </div>`
    },
    renderMonthCell(date, meta) {
      const priceRange = getMonthPriceRange(date.getFullYear(), date.getMonth())

      return `<div class="py-1">
        <div>${date.toLocaleDateString('en-US', { month: 'short' })}</div>
        <div class="${meta.isSelected ? 'text-reset' : 'text-body-tertiary'}" style="font-size: 0.75rem;">${priceRange ? `$${priceRange.min}-$${priceRange.max}` : '-'}</div>
      </div>`
    },
    renderYearCell(date, meta) {
      const priceRange = getYearPriceRange(date.getFullYear())

      return `<div class="py-1">
        <div>${date.getFullYear()}</div>
        <div class="${meta.isSelected ? 'text-reset' : 'text-body-tertiary'}" style="font-size: 0.75rem;">${priceRange ? `$${priceRange.min}-$${priceRange.max}` : '-'}</div>
      </div>`
    }
  })

  // Fetch data when date or view changes
  const handleDataUpdate = (date, view) => {
    const dateRange = getDateRangeForView(date, view)
    if (dateRange) {
      fetchPricingData(dateRange.startDate, dateRange.endDate, view).then(() => {
        calendar.refresh()
      })
    }
  }

  // Listen for calendar date changes
  myCalendarCustomizeCells.addEventListener('calendarDateChange.coreui.calendar', event => {
    handleDataUpdate(event.date, event.view || 'days')
  })

  // Listen for calendar view changes
  myCalendarCustomizeCells.addEventListener('calendarViewChange.coreui.calendar', event => {
    if (event.source !== 'cellClick') {
      handleDataUpdate(calendar._calendarDate || initialDate, event.view)
    }
  })
}

initCalendar()
// js-docs-end calendar-customize-cells
