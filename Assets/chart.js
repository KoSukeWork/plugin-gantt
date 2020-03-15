// Based on jQuery.ganttView v.0.8.8 Copyright (c) 2010 JC Grubbs - jc.grubbs@devmynd.com - MIT License
var Gantt = function () {
    this.data = [];
    // this.subdata = [];
    //[{id:1,data:[{xxxxx}],show:true}]

    this.options = {
        container: "#gantt-chart",
        showWeekends: true,
        showToday: true,
        allowMoves: true,
        allowResizes: true,
        cellWidth: 21,
        cellHeight: 31,
        slideWidth: 1000,
        vHeaderWidth: 200
    };
};

// Save record after a resize or move
Gantt.prototype.saveRecord = function (record) {
    console.log(record);
    let url=$(this.options.container).data("save-url");
    if(record.type==="task" && $(this.options.container).data('type')!="task") url=$(this.options.container).data("save-task-url")+"&project_id="+record.proid;
    $.ajax({
        cache: false,
        url: url,
        contentType: "application/json",
        type: "POST",
        processData: false,
        data: JSON.stringify(record)
    });
};

Gantt.prototype.getTaskJSON = function (id) {
    let s = this.data.find(x => x.proid == id);
    let d = this.data.findIndex(x => x.id == id && x.type === 'project');
    console.log(d);
    if (s === undefined) {
        $.ajax({
            cache: false,
            url: this.data[d].gantt_json_link,
            contentType: "application/json",
            type: "GET",
            processData: true,
            // data: JSON.stringify(record)
            success: req => {
                console.log('ajax', req.tasks);
                // if (req.tasks.length > 0) {
                //     this.subdata.push(this.prepareSubData({ id: id, show: true, data: req.tasks }))
                //     console.log('sub', this.subdata);
                //     this.reshow();
                // }
                if (req.tasks.length > 0) {
                    let tasks = this.prepareData(req.tasks);
                    console.log('task', tasks)
                    tasks.forEach(x => {
                        x.proid = id;
                        x.show = true;
                        this.data.splice(d + 1, 0, x)
                    })
                    console.log(this.data)
                    this.show(re = true);
                    KB.tooltip();
                }
            }
        });
    } else {
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].proid == id) {
                this.data[i].show = !this.data[i].show
            }
        }
        this.show(re = true)
        KB.tooltip();
        // this.subdata[s].show = (!this.subdata[s].show);
        // this.reshow();

    }

};

// Gantt.prototype.reshow = function () {
//     // this.subdata = this.prepareSubData(this.subdata);
//     var minDays = Math.floor((this.options.slideWidth / this.options.cellWidth) + 5);
//     var range = this.getDateRange(minDays);
//     var startDate = range[0];
//     var endDate = range[1];
//     var container = $(this.options.container);
//     var chart = jQuery("<div>", { "class": "ganttview" });
//     jQuery("div.ganttview").empty();
//     chart.append(this.renderVerticalHeader());
//     chart.append(this.renderSlider(startDate, endDate));
//     container.append(chart);

//     jQuery("div.ganttview-grid-row div.ganttview-grid-row-cell:last-child", container).addClass("last");
//     jQuery("div.ganttview-hzheader-days div.ganttview-hzheader-day:last-child", container).addClass("last");
//     jQuery("div.ganttview-hzheader-months div.ganttview-hzheader-month:last-child", container).addClass("last");

//     if (!$(this.options.container).data('readonly')) {
//         this.listenForBlockResize(startDate);
//         this.listenForBlockMove(startDate);
//     }
//     else {
//         this.options.allowResizes = false;
//         this.options.allowMoves = false;
//     }
// };

// Build the Gantt chart
Gantt.prototype.show = function (re = false) {
    if (!re) {
        this.data = this.prepareData($(this.options.container).data('records'));
    }
    var minDays = Math.floor((this.options.slideWidth / this.options.cellWidth) + 5);
    var range = this.getDateRange(minDays);
    var startDate = range[0];
    var endDate = range[1];
    var container = $(this.options.container);
    if (re) jQuery("div.ganttview").remove();
    var chart = jQuery("<div>", { "class": "ganttview" });

    chart.append(this.renderVerticalHeader());
    chart.append(this.renderSlider(startDate, endDate));
    container.append(chart);

    jQuery("div.ganttview-grid-row div.ganttview-grid-row-cell:last-child", container).addClass("last");
    jQuery("div.ganttview-hzheader-days div.ganttview-hzheader-day:last-child", container).addClass("last");
    jQuery("div.ganttview-hzheader-months div.ganttview-hzheader-month:last-child", container).addClass("last");

    if (!$(this.options.container).data('readonly')) {
        this.listenForBlockResize(startDate);
        this.listenForBlockMove(startDate);
    }
    else {
        this.options.allowResizes = false;
        this.options.allowMoves = false;
    }
    console.log("data", this.data);
};

Gantt.prototype.infoTooltip = function (content) {
    var markdown = $("<div>", { "class": "markdown" }).append(content);
    var script = $("<script>", { "type": "text/template" }).append(markdown);
    var icon = $('<i>', { "class": "fa fa-info-circle" });
    return $('<span>', { "class": "tooltip" }).append(icon).append(script);
};

// Render record list on the left
Gantt.prototype.renderVerticalHeader = function () {
    var headerDiv = jQuery("<div>", { "class": "ganttview-vtheader" });
    var itemDiv = jQuery("<div>", { "class": "ganttview-vtheader-item" });
    var seriesDiv = jQuery("<div>", { "class": "ganttview-vtheader-series" });

    for (var i = 0; i < this.data.length; i++) {
        
        if (this.data[i].type == "task" && !this.data[i].show && $(this.options.container).data('type')!="task") continue;
        var content = jQuery("<span>")
            .append(this.infoTooltip(this.getVerticalHeaderTooltip(this.data[i])))
            .append("&nbsp;");
 
        if (this.data[i].type == "task" && this.data[i].show && $(this.options.container).data('type')!="task") {
            content.prepend("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
            content.append(jQuery('<strong>').text('#' + this.data[i].id + ' '));
            content.append(jQuery("<a>", { "href": this.data[i].link, "title": this.data[i].title }).text(this.data[i].title));
        }
        if (this.data[i].type == "task" && $(this.options.container).data('type')=="task") {
            // content.prepend("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
            content.append(jQuery('<strong>').text('#' + this.data[i].id + ' '));
            content.append(jQuery("<a>", { "href": this.data[i].link, "title": this.data[i].title }).text(this.data[i].title));
        }
        if (this.data[i].type == "project") {
            content
                .append(jQuery("<a>", { "href": this.data[i].board_link, "title": $(this.options.container).data("label-board-link") }).append('<i class="fa fa-th"></i>'))
                .append("&nbsp;")
                .append(jQuery("<a>", { "href": this.data[i].gantt_link, "title": $(this.options.container).data("label-gantt-link") }).append('<i class="fa fa-sliders"></i>'))
                .append("&nbsp;")
                .append(jQuery("<a>", { "href": this.data[i].link }).text(this.data[i].title))
                // .append("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")
                .append(jQuery("<a>", { "href": '#', "class": "ganttview-float-right task_show", "data-id": this.data[i].id }).append('<i class="fa fa-caret-down"></i>'));
            // console.log("listID", this.data[i].id);
            // let d = this.subdata.find(x => (x.id == this.data[i].id && x.show));
            // console.log('list', d);
            // if (d !== undefined) {
            //     d.data.forEach(x => {
            //         var cont = jQuery("<span>")
            //             .append(this.infoTooltip(this.getVerticalHeaderTooltip(x)))
            //             .append("&nbsp;");
            //         cont.append(jQuery('<strong>').text('#' + x.id + ' '));
            //         cont.append(jQuery("<a>", { "href": x.link, "title": x.title }).text(x.title));
            //     })

            // }
        }

        seriesDiv.append(jQuery("<div>", { "class": "ganttview-vtheader-series-name" }).append(content));
    }

    itemDiv.append(seriesDiv);
    headerDiv.append(itemDiv);
    return headerDiv;
};

// Render right part of the chart (top header + grid + bars)
Gantt.prototype.renderSlider = function (startDate, endDate) {
    var slideDiv = jQuery("<div>", { "class": "ganttview-slide-container" });
    var dates = this.getDates(startDate, endDate);

    slideDiv.append(this.renderHorizontalHeader(dates));
    slideDiv.append(this.renderGrid(dates));
    slideDiv.append(this.addBlockContainers());
    this.addBlocks(slideDiv, startDate);

    return slideDiv;
};

// Render top header (days)
Gantt.prototype.renderHorizontalHeader = function (dates) {
    var headerDiv = jQuery("<div>", { "class": "ganttview-hzheader" });
    var monthsDiv = jQuery("<div>", { "class": "ganttview-hzheader-months" });
    var daysDiv = jQuery("<div>", { "class": "ganttview-hzheader-days" });
    var totalW = 0;

    for (var y in dates) {
        for (var m in dates[y]) {
            var w = dates[y][m].length * this.options.cellWidth;
            totalW = totalW + w;

            monthsDiv.append(jQuery("<div>", {
                "class": "ganttview-hzheader-month",
                "css": { "width": (w - 1) + "px" }
            }).append($.datepicker.regional[$("html").attr('lang')].monthNames[m] + " " + y));

            for (var d in dates[y][m]) {
                daysDiv.append(jQuery("<div>", { "class": "ganttview-hzheader-day" }).append(dates[y][m][d].getDate()));
            }
        }
    }

    monthsDiv.css("width", totalW + "px");
    daysDiv.css("width", totalW + "px");
    headerDiv.append(monthsDiv).append(daysDiv);

    return headerDiv;
};

// Render grid
Gantt.prototype.renderGrid = function (dates) {
    var gridDiv = jQuery("<div>", { "class": "ganttview-grid" });
    var rowDiv = jQuery("<div>", { "class": "ganttview-grid-row" });

    for (var y in dates) {
        for (var m in dates[y]) {
            for (var d in dates[y][m]) {
                var cellDiv = jQuery("<div>", { "class": "ganttview-grid-row-cell" });
                if (this.options.showWeekends && this.isWeekend(dates[y][m][d])) {
                    cellDiv.addClass("ganttview-weekend");
                }
                if (this.options.showToday && this.isToday(dates[y][m][d])) {
                    cellDiv.addClass("ganttview-today");
                }
                rowDiv.append(cellDiv);
            }
        }
    }
    var w = jQuery("div.ganttview-grid-row-cell", rowDiv).length * this.options.cellWidth;
    rowDiv.css("width", w + "px");
    gridDiv.css("width", w + "px");

    for (var i = 0; i < this.data.length; i++) {
        gridDiv.append(rowDiv.clone());
    }

    return gridDiv;
};

// Render bar containers
Gantt.prototype.addBlockContainers = function () {
    var blocksDiv = jQuery("<div>", { "class": "ganttview-blocks" });

    for (var i = 0; i < this.data.length; i++) {
        blocksDiv.append(jQuery("<div>", { "class": "ganttview-block-container" }));
    }

    return blocksDiv;
};

// Render bars
Gantt.prototype.addBlocks = function (slider, start) {
    var rows = jQuery("div.ganttview-blocks div.ganttview-block-container", slider);
    var rowIdx = 0;

    for (var i = 0; i < this.data.length; i++) {
        var series = this.data[i];
        if (series.type === 'task' && !series.show && $(this.options.container).data('type')!="task") continue;
        var size = this.daysBetween(series.start, series.end) + 1;
        var offset = this.daysBetween(start, series.start);
        var text = jQuery("<div>", {
            "class": "ganttview-block-text",
            "css": {
                "width": ((size * this.options.cellWidth) - 19) + "px"
            }
        });

        var block = jQuery("<div>", {
            "class": "ganttview-block" + (this.options.allowMoves ? " ganttview-block-movable" : ""),
            "css": {
                "width": ((size * this.options.cellWidth) - 9) + "px",
                "margin-left": (offset * this.options.cellWidth) + "px"
            }
        }).append(text);

        if (series.type === 'task') {
            this.addTaskBarText(text, series, size);
        }

        block.data("record", series);
        this.setBarColor(block, series);

        jQuery(rows[rowIdx]).append(block);
        rowIdx = rowIdx + 1;
    }
};

Gantt.prototype.addTaskBarText = function (container, record, size) {
    if (size >= 4) {
        container.html($('<span>').text(record.progress + ' - #' + record.id + ' ' + record.title));
    }
    else if (size >= 2) {
        container.html($('<span>').text(record.progress));
    }
};

// Get tooltip for vertical header
Gantt.prototype.getVerticalHeaderTooltip = function (record) {
    if (record.type === 'task') {
        return this.getTaskTooltip(record);
    }

    return this.getProjectTooltip(record);
};

Gantt.prototype.getTaskTooltip = function (record) {
    var assigneeLabel = $(this.options.container).data("label-assignee");
    var tooltip = $('<span>')
        .append($('<strong>').text(record.column_title + ' (' + record.progress + ')'))
        .append($('<br>'))
        .append($('<span>').text('#' + record.id + ' ' + record.title))
        .append($('<br>'))
        .append($('<span>').text(assigneeLabel + ' ' + (record.assignee ? record.assignee : '')));

    return this.getTooltipFooter(record, tooltip);
};

Gantt.prototype.getProjectTooltip = function (record) {
    var tooltip = $('<span>');

    if ('project-manager' in record.users) {
        var projectManagerLabel = $(this.options.container).data('label-project-manager');
        var list = $('<ul>');

        for (var user_id in record.users['project-manager']) {
            list.append($('<li>').append($('<span>').text(record.users['project-manager'][user_id])));
        }

        tooltip.append($('<strong>').text(projectManagerLabel));
        tooltip.append($('<br>'));
        tooltip.append(list);
    }

    return this.getTooltipFooter(record, tooltip);
};

Gantt.prototype.getTooltipFooter = function (record, tooltip) {
    var notDefinedLabel = $(this.options.container).data("label-not-defined");
    var startDateLabel = $(this.options.container).data("label-start-date");
    var startEndLabel = $(this.options.container).data("label-end-date");

    if (record.not_defined) {
        tooltip.append($('<br>')).append($('<em>').text(notDefinedLabel));
    } else {
        tooltip.append($('<br>'));
        tooltip.append($('<strong>').text(startDateLabel + ' ' + $.datepicker.formatDate('yy-mm-dd', record.start)));
        tooltip.append($('<br>'));
        tooltip.append($('<strong>').text(startEndLabel + ' ' + $.datepicker.formatDate('yy-mm-dd', record.end)));
    }

    return tooltip;
};

// Set bar color
Gantt.prototype.setBarColor = function (block, record) {
    block.css("background-color", record.color.background);
    block.css("border-color", record.color.border);

    if (record.not_defined) {
        if (record.date_started_not_defined) {
            block.css("border-left", "2px solid #000");
        }

        if (record.date_due_not_defined) {
            block.css("border-right", "2px solid #000");
        }
    }

    if (record.progress != "0%") {
        var progressBar = $(block).find(".ganttview-progress-bar");

        if (progressBar.length) {
            progressBar.css("width", record.progress);
        } else {
            block.append(jQuery("<div>", {
                "class": "ganttview-progress-bar",
                "css": {
                    "background-color": record.color.border,
                    "width": record.progress,
                }
            }));
        }
    }
};

// Setup jquery-ui resizable
Gantt.prototype.listenForBlockResize = function (startDate) {
    var self = this;

    jQuery("div.ganttview-block", this.options.container).resizable({
        grid: this.options.cellWidth,
        handles: "e,w",
        delay: 300,
        stop: function () {
            var block = jQuery(this);
            self.updateDataAndPosition(block, startDate);
            self.saveRecord(block.data("record"));
        }
    });
};

// Setup jquery-ui drag and drop
Gantt.prototype.listenForBlockMove = function (startDate) {
    var self = this;

    jQuery("div.ganttview-block", this.options.container).draggable({
        axis: "x",
        delay: 300,
        grid: [this.options.cellWidth, this.options.cellWidth],
        stop: function () {
            var block = jQuery(this);
            self.updateDataAndPosition(block, startDate);
            self.saveRecord(block.data("record"));
        }
    });
};

// Update the record data and the position on the chart
Gantt.prototype.updateDataAndPosition = function (block, startDate) {
    var container = jQuery("div.ganttview-slide-container", this.options.container);
    var scroll = container.scrollLeft();
    var offset = block.offset().left - container.offset().left - 1 + scroll;
    var record = block.data("record");

    // Restore color for defined block
    record.not_defined = false;
    this.setBarColor(block, record);

    // Set new start date
    var daysFromStart = Math.round(offset / this.options.cellWidth);
    var newStart = this.addDays(this.cloneDate(startDate), daysFromStart);
    if (!record.date_started_not_defined || this.compareDate(newStart, record.start)) {
        record.start = this.addDays(this.cloneDate(startDate), daysFromStart);
        record.date_started_not_defined = true;
    }
    else if (record.date_started_not_defined) {
        delete record.start;
    }

    // Set new end date
    var width = block.outerWidth();
    var numberOfDays = Math.round(width / this.options.cellWidth) - 1;
    var newEnd = this.addDays(this.cloneDate(newStart), numberOfDays);
    if (!record.date_due_not_defined || this.compareDate(newEnd, record.end)) {
        record.end = newEnd;
        record.date_due_not_defined = true;
    }
    else if (record.date_due_not_defined) {
        delete record.end;
    }

    if (record.type === "task" && numberOfDays > 0) {
        this.addTaskBarText(jQuery("div.ganttview-block-text", block), record, numberOfDays);
    }

    block.data("record", record);

    // Remove top and left properties to avoid incorrect block positioning,
    // set position to relative to keep blocks relative to scrollbar when scrolling
    block
        .css("top", "")
        .css("left", "")
        .css("position", "relative")
        .css("margin-left", offset + "px");
};

// Creates a 3 dimensional array [year][month][day] of every day
// between the given start and end dates
Gantt.prototype.getDates = function (start, end) {
    var dates = [];
    dates[start.getFullYear()] = [];
    dates[start.getFullYear()][start.getMonth()] = [start];
    var last = start;

    while (this.compareDate(last, end) == -1) {
        var next = this.addDays(this.cloneDate(last), 1);

        if (!dates[next.getFullYear()]) {
            dates[next.getFullYear()] = [];
        }

        if (!dates[next.getFullYear()][next.getMonth()]) {
            dates[next.getFullYear()][next.getMonth()] = [];
        }

        dates[next.getFullYear()][next.getMonth()].push(next);
        last = next;
    }

    return dates;
};

// Convert data to Date object
Gantt.prototype.prepareData = function (data) {
    for (var i = 0; i < data.length; i++) {
        console.log('d', data);
        var start = new Date(data[i].start[0], data[i].start[1] - 1, data[i].start[2], 0, 0, 0, 0);
        data[i].start = start;

        var end = new Date(data[i].end[0], data[i].end[1] - 1, data[i].end[2], 0, 0, 0, 0);
        data[i].end = end;
    }

    return data;
};
// Gantt.prototype.prepareSubData = function (data) {

//     // for (var i = 0; i < data.length; i++) {
//     data.data = this.prepareData(data.data);
//     // }
//     console.log("preend", data);
//     return data;
// };

// Get the start and end date from the data provided
Gantt.prototype.getDateRange = function (minDays) {
    var minStart = new Date();
    var maxEnd = new Date();

    for (var i = 0; i < this.data.length; i++) {
        var start = new Date();
        start.setTime(Date.parse(this.data[i].start));

        var end = new Date();
        end.setTime(Date.parse(this.data[i].end));

        if (i == 0) {
            minStart = start;
            maxEnd = end;
        }

        if (this.compareDate(minStart, start) == 1) {
            minStart = start;
        }

        if (this.compareDate(maxEnd, end) == -1) {
            maxEnd = end;
        }
    }

    // if (this.subdata.length > 0) {
    //     console.log("sub-get", this.subdata.filter(x => x.show));
    //     this.subdata.filter(x => x.show).forEach(x => {
    //         x.data.forEach(d => {
    //             // console.log('d', d);
    //             var start = new Date();
    //             start.setTime(Date.parse(d.start));

    //             var end = new Date();
    //             end.setTime(Date.parse(d.end));

    //             if (i == 0) {
    //                 minStart = start;
    //                 maxEnd = end;
    //             }

    //             if (this.compareDate(minStart, start) == 1) {
    //                 minStart = start;
    //             }

    //             if (this.compareDate(maxEnd, end) == -1) {
    //                 maxEnd = end;
    //             }
    //         })
    //     })
    // this.subdata.filter(x => x.show).map(d => d.data).reduce((x, y) => x.concat(y), []).forEach(data => {

    //     var start = new Date();
    //     start.setTime(Date.parse(data.start));

    //     var end = new Date();
    //     end.setTime(Date.parse(data.end));

    //     if (i == 0) {
    //         minStart = start;
    //         maxEnd = end;
    //     }

    //     if (this.compareDate(minStart, start) == 1) {
    //         minStart = start;
    //     }

    //     if (this.compareDate(maxEnd, end) == -1) {
    //         maxEnd = end;
    //     }
    // });

    // }


    // Insure that the width of the chart is at least the slide width to avoid empty
    // whitespace to the right of the grid
    if (this.daysBetween(minStart, maxEnd) < minDays) {
        maxEnd = this.addDays(this.cloneDate(minStart), minDays);
    }

    // Always start one day before the minStart
    minStart.setDate(minStart.getDate() - 1);
    return [minStart, maxEnd];
};

// Returns the number of day between 2 dates
Gantt.prototype.daysBetween = function (start, end) {
    if (!start || !end) {
        return 0;
    }

    var count = 0, date = this.cloneDate(start);

    while (this.compareDate(date, end) == -1) {
        count = count + 1;
        this.addDays(date, 1);
    }

    return count;
};

// Return true if it's the weekend
Gantt.prototype.isWeekend = function (date) {
    return date.getDay() % 6 == 0;
};

// Return true if it's today
Gantt.prototype.isToday = function (date) {
    var today = new Date();
    return today.toDateString() == date.toDateString();
};

// Clone Date object
Gantt.prototype.cloneDate = function (date) {
    return new Date(date.getTime());
};

// Add days to a Date object
Gantt.prototype.addDays = function (date, value) {
    date.setDate(date.getDate() + value * 1);
    return date;
};

/**
 * Compares the first date to the second date and returns an number indication of their relative values.
 *
 * -1 = date1 is lessthan date2
 * 0 = values are equal
 * 1 = date1 is greaterthan date2.
 */
Gantt.prototype.compareDate = function (date1, date2) {
    if (isNaN(date1) || isNaN(date2)) {
        throw new Error(date1 + " - " + date2);
    } else if (date1 instanceof Date && date2 instanceof Date) {
        return (date1 < date2) ? -1 : (date1 > date2) ? 1 : 0;
    } else {
        throw new TypeError(date1 + " - " + date2);
    }
};
