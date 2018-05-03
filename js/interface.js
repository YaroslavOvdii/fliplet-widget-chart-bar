var defaultChartHeight = '400px';
var defaultData = {
  dataSourceQuery: undefined,
  separateChartHeights: false,
  chartHeightSm: defaultChartHeight,
  chartHeightMd: defaultChartHeight,
  showDataLegend: true,
  showDataValues: true,
  yAxisTitle: '',
  xAxisTitle: '',
  showTotalEntries: false,
  autoRefresh: false
};
var data = $.extend(defaultData, Fliplet.Widget.getData());

var dsQueryData = {
  settings: {
    dataSourceLabel: 'Select a data source',
    modesDescription: 'How do you want your data to be plotted?',
    modes: [
      {
        label: 'Plot my data as it is',
        filters: false,
        columns: [
          {
            key: 'category',
            label: 'Select the column with the categories',
            type: 'single'
          },
          {
            key: 'value',
            label: 'Select the column with the values',
            type: 'single'
          }
        ]
      },
      {
        label: 'Summarize my data',
        filters: false,
        columns: [
          {
            key: 'column',
            label: 'Select a column',
            type: 'single'
          }
        ]
      }
    ]
  },
  result: data.dataSourceQuery
};

var $dataSortOrder = $('#select-data-sort-order');

var dsQueryProvider = Fliplet.Widget.open('com.fliplet.data-source-query', {
  selector: '.data-source-query',
  data: dsQueryData,
  onEvent: function (event, data) {
    if (event === 'mode-changed') {
      switch (data.value) {
        case 0:
        default:
          $('.column-sort-order').addClass('hidden');
          break;
        case 1:
          $('.column-sort-order').removeClass('hidden');
          break;
      }
      return true; // Stop propagation up to studio or parent components
    }
  }
});

// Ensure chart heights have a correct default & units
function validateChartHeight(val) {
  if (typeof val !== 'string') {
    val = val.toString() || '';
  }

  if (!val || parseFloat(val) <= 0) {
    // Set empty or non-empty values to the default
    val = defaultChartHeight;
  }

  if (/^\d+$/.test(val)) {
    // Value contains only numbers
    val = val + 'px';
  }

  return val;
}

function validateForm() {
  // Validate chart height
  $('#chart_height_sm').val(validateChartHeight($('#chart_height_sm').val()));
  $('#chart_height_md').val(validateChartHeight($('#chart_height_md').val()));
}

function attachObservers() {
  dsQueryProvider.then(function(result){
    validateForm();
    
    Fliplet.Widget.save({
      // dataSourceId: parseInt($dataSource.val(), 10),
      // dataSourceColumn: $dataColumns.val(),
      dataSourceQuery: result.data,
      dataSortOrder: $dataSortOrder.find(':selected').val(),
      separateChartHeights: $('#separate_chart_heights').is(':checked'),
      chartHeightSm: $('#chart_height_sm').val(),
      chartHeightMd: $('#chart_height_md').val(),
      showDataLegend: $('#show_data_legend:checked').val() === "show",
      showDataValues: $('#show_data_values:checked').val() === "show",
      yAxisTitle: $('#y_axis_title').val(),
      xAxisTitle: $('#x_axis_title').val(),
      showTotalEntries: $('#show_total_entries:checked').val() === "show",
      autoRefresh: $('#auto_refresh:checked').val() === "refresh"
    }).then(function () {
      Fliplet.Widget.complete();
      Fliplet.Studio.emit('reload-page-preview');
    });
  });

  // Fired from Fliplet Studio when the external save button is clicked
  Fliplet.Widget.onSaveRequest(function () {
    dsQueryProvider.forwardSaveRequest();
  });

  $('#separate_chart_heights').on('change', function () {
    $('#chart_height_md').prop('disabled', !$(this).is(':checked'));

    // Set tablet/desktop chart height to match mobile chart height
    // if user chooses not to use different chart heights
    if (!$(this).is(':checked')) {
      $('#chart_height_md').val($('#chart_height_sm').val());
    }
  });

  // Sync mobile and tablet/desktop chart heights if user
  // chooses not to use different chart heights
  $('#chart_height_sm').on('change keyup input', function () {
    if (!$('#separate_chart_heights').is(':checked')) {
      $('#chart_height_md').val($('#chart_height_sm').val());
    }
  });
}

attachObservers();

// LOAD CHART SETTINGS
if (data) {
  $('#separate_chart_heights').prop('checked', data.separateChartHeights).trigger('change');
  $('#chart_height_sm').val(data.chartHeightSm);
  $('#chart_height_md').val(data.chartHeightMd);
  $('#show_data_legend').prop('checked', data.showDataLegend);
  $('#show_data_values').prop('checked', data.showDataValues);
  $('#y_axis_title').val(data.yAxisTitle);
  $('#x_axis_title').val(data.xAxisTitle);
  $('#show_total_entries').prop('checked', data.showTotalEntries);
  $('#auto_refresh').prop('checked', data.autoRefresh);
  if (data.dataSourceQuery && data.dataSourceQuery.selectedModeIdx === 1) {
    $('.column-sort-order').removeClass('hidden');
  }
}