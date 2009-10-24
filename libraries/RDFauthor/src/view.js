//
// This file is part of the RDFauthor Widget Library
//
// A library that allows to inject editing functionality into an 
// RDFa-annotated HTML web site.
// 
// Copyright (c) 2008 Norman Heino <norman.heino@gmail.com>
// Version: $Id: view.js 4281 2009-10-12 10:24:00Z norman.heino $
//

//
// RDFauthorView
//
// RDFa Editing View
// Author: Norman Heino <norman.heino@gmail.com>
//
function RDFauthorView(options) {
    // default options
    var defaults = {
        title: 'Edit Properties', 
        saveButtonTitle: 'Save', 
        cancelButtonTitle: 'Cancel', 
        addPropertyButtonTitle: 'Add Property', 
        showButtons: true, 
        showAddPropertyButton: true, 
        animationTime: 250,   // ms
        id: 'rdfAuthorContainer'
    };
    this.options = $.extend(defaults, options);
    
    this.container = this.options.container != 'undefined' ? this.options.container : $('body');
    
    // the property selector object
    this.propertySelector = null;
    
    // subject => property => row
    this.rows = {};
    
    // id => row
    this.rowsById = {};
    
    this.id = this.options.id;
    
    // retain this for private members
    var instance = this;
    
    function getChrome() {
        var chrome = '\
            <div class="window" id="' + instance.id + '" style="display:none">\
                <h2 class="title">' + instance.options.title + '</h2>\
                <div class="rdfAuthorPropertyRows">\
                </div>\
                    ' + getButtons() + '\
                <div style="clear:both"></div>\
            </div>';
        
        return chrome;
    }
    
    if ($('#' + this.id).length < 1) {
        // append chrome
        var chromeHtml = getChrome();
        this.container.append(chromeHtml);
    }
    
    function getButtons() {
        var buttonsHtml = '';
        if (instance.options.showButtons) {
            
            var propertyButton = '';
            if (instance.options.showAddPropertyButton) {
                propertyButton = '\
                    <button type="button" class="rdfAuthorButtonAddProperty">\
                        ' + instance.options.addPropertyButtonTitle + '\
                    </button>';
            }
            
            buttonsHtml = '\
                <div id="rdfAuthorButtons">\
                    ' + propertyButton + '\
                    <button type="button" class="rdfAuthorButtonCancel">' + instance.options.cancelButtonTitle + '</button>\
                    <button type="button" class="rdfAuthorButtonSave">' + instance.options.saveButtonTitle + '</button>\
                </div>';
        }
        
        return buttonsHtml;
    }
    
    //
    // Privileged methods
    //
    
    this.reset = function () {
        // reset data
        this.rows = {};
        this.rowsById = {};

        // reset HTML
        if ($('#' + this.id).length) {
            $('#' + this.id).replaceWith(getChrome());
        }
    };
}

//
// Public shared methods
//

RDFauthorView.prototype.addRow = function (subject, property, title, object, graph) {    
    if (!(subject in this.rows)) {
        this.rows[subject] = {};
    }
    
    var row;
    if (property in this.rows[subject]) {
        // property row already exists
        row = this.rows[subject][property];
    } else {
        // create new property row
        var container = $('.rdfAuthorPropertyRows');
        row = new RDFauthorPropertyRow(container, subject, property, title);
        this.rows[subject][property] = row;
        
        this.rowsById[row.id] = row;
    }
    
    return row.addWidget(object, graph);
};

RDFauthorView.prototype.addWidgetInstance = function (widgetInstance) {
    var container = $('.rdfAuthorPropertyRows');
    var newProperty = '\
        <div class="container" id="newPropertyContainer123">\
            ' + widgetInstance.getHtml() + '<button id="addWidgetButton">Add Widget</button>\
        </div>';
    container.append(newProperty);
    
    var instance = this;
    $('#addWidgetButton').click(function() {
        var info = widgetInstance.getValue();
        instance.addRow(subject, info.uri, info.title, null, graph);
    });
    
    // process init request
    if (typeof widgetInstance.init == 'function') {
        widgetInstance.init();
    }
};

RDFauthorView.prototype.callHook = function (hookName) {
    if (typeof this.options[hookName] == 'function') {
        this.options[hookName]();
    }
};

RDFauthorView.prototype.display = function (animated) {
    // make draggable if jQuery UI loaded
    if (typeof jQuery.ui != 'undefined' && !$('#' + this.id).hasClass('ui-draggable')) {
        $('#' + this.id).draggable({handle: 'h2', zIndex: 1000});
    }
    
    // force max height for container
    var getDimensions = function() {
        var el = $(window);

		// fix a jQuery/Opera bug with determining the window height
		var h = $.browser.opera && $.browser.version > '9.5' && $.fn.jquery <= '1.2.6' ? document.documentElement['clientHeight'] :
			$.browser.opera && $.browser.version < '9.5' && $.fn.jquery > '1.2.6' ? window.innerHeight :
			el.height();

		return [h, el.width()];
    }        
    // var htmlHeight  = $('html').height();
    // var modalHeight = this.container.height();
    // this.container.height(Math.max(htmlHeight, modalHeight) + 'px');
    
    var d = getDimensions();
    this.container.height(d[0]);
    this.container.width(d[1]);
    
    this.container.show();
    this.reposition();
    var instance = this;
    var initRows = function() {            
        for (var subject in instance.rows) {
            for (var property in instance.rows[subject]) {
                var row = instance.rows[subject][property];

                row.initDisplay();
            }
        }
    };
    
    
    if (!animated) {
        $('#' + this.id).show();
        initRows();
    } else {
        $('#' + this.id).fadeIn(this.options.animationTime, initRows);
    }    
};

RDFauthorView.prototype.getPropertySelector = function () {
    if (null === this.propertySelector) {
        var instance  = this;
        
        var graph   = RDFauthor.getDefaultGraph();
        var subject = RDFauthor.getDefaultResource();
        
        var selectorOptions = {
            container: '.rdfAuthorPropertyRows', 
            callback: function() {
                var propertySelector = instance.getPropertySelector();
                var propertyUri      = propertySelector.selectedProperty();
                var propertyTitle    = propertySelector.selectedPropertyTitle();
                
                // TODO: animate
                propertySelector.dismiss(false);
                
                var id = instance.addRow(subject, propertyUri, propertyTitle, null, graph);
                var widgetTop    = $('#' + id).offset().top;
                var containerTop = $('.rdfAuthorPropertyRows').offset().top;
                
                if (widgetTop > 0) {
                    $('.rdfAuthorPropertyRows').animate({scrollTop: (widgetTop - containerTop) + 'px'}, instance.options.animationTime);
                }
            }, 
            id: 'rdfAuthorPropertySelector'
        };
        this.propertySelector = new RDFauthorPropertySelector(selectorOptions);
    }
    
    return this.propertySelector;
};

RDFauthorView.prototype.getRow = function (id) {
    var row = null;
    
    if (id in this.rowsById) {
        row = this.rowsById[id];
    }
    
    return row;
};

RDFauthorView.prototype.hide = function (animated, callback) {
    if (!animated) {
        $('#' + this.id).hide();
        this.container.hide();
    } else {
        var instance = this;
        $('#' + this.id).fadeOut(this.options.animationTime, function() {
            instance.container.hide();
            if (typeof callback == 'function') {
                callback();
            }
        });
    }
};

RDFauthorView.prototype.onAddProperty = function () {
    this.callHook('addProperty');
    
    var selector = this.getPropertySelector();
    selector.showInContainer(null, null, true);
};

RDFauthorView.prototype.onCancel = function () {
    this.callHook('beforeCancel');
    
    for (var subject in this.rows) {
        for (var property in this.rows[subject]) {
            var row = this.rows[subject][property];
            row.onCancel();
        }
    }
    
    // dismiss property selector
    if (this.propertySelector) {
        this.propertySelector.dismiss(false);
    }
    
    this.callHook('afterCancel');
};

RDFauthorView.prototype.onSubmit = function () {
    this.callHook('beforeSubmit');
    
    var submitOk = true;
    for (var subject in this.rows) {
        for (var property in this.rows[subject]) {
            var row = this.rows[subject][property];
            submitOk = row.onSubmit() && submitOk;
        }
    }
    
    // dismiss property selector
    if (this.propertySelector) {
        this.propertySelector.dismiss(false);
    }
    
    if (submitOk) {
        this.callHook('afterSubmit');
    }
};

RDFauthorView.prototype.reposition = function () {
    var center = {
        x: window.innerWidth / 2, 
        y: window.innerHeight / 2
    };
    
    var viewOffset = {
        x: $('#' + this.id).width() / 2, 
        y: $('#' + this.id).height() / 2
    };
    
    // 10 % of window size above center
    var relocation = {
        x: 0, 
        y: -(window.innerHeight * 0.1)
    };
    
    // position
    $('#' + this.id)
        .css('top', Math.max(Math.floor(center.y - viewOffset.y + relocation.y), 0) + 'px')
        .css('left', Math.max(Math.floor(center.x - viewOffset.x + relocation.x), 0) + 'px');
};

///////////////////////////////////////////////////////////////////////////////

// create live triggers for click buttons
$('document').ready(function() {
    $('#rdfAuthorButtons .rdfAuthorButtonSave').live('click', function() {
        var view = RDFauthor.getView();
        view.onSubmit();
    });
    
    $('#rdfAuthorButtons .rdfAuthorButtonCancel').live('click', function() {
        var view = RDFauthor.getView();
        view.onCancel();
    });
    
    $('#rdfAuthorButtons .rdfAuthorButtonAddProperty').live('click', function() {
        var view = RDFauthor.getView();
        view.onAddProperty();
    });
});
