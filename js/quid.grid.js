(function( $ ){

    var methods = {
        init : function( options ) {
            
            var settings = $.extend({}, $.fn.quidGrid.defaults, options);
            
            return this.each(function(){
            
                var $grid = $(this);
                var data = $grid.data('quid-grid');
                
                // Has the grid been initialized?
                if( !data ) {
                    data = {
                        'settings' : settings,
                        'model' : []
                    };
                    
                    var $thead = $('thead', $grid);
                    var $tbody = $('tbody', $grid);
        
                    var colClasses = [];
                    var html = [];
                    html.push('<div ' , _attribute($grid, 'id') ,  ' class="quid-grid ' , $grid.attr('class') ,  '">');
        
                    html.push('<ul class="quid-thead '  , $thead.attr('class') , '" '  ,  _attribute($thead, 'style') , '>');
                    var rows = $thead.children();
                    var $row;
                    for(var i=0,l=rows.length;i<l;i++){
                            $row = $(rows[i]);
                            html.push('<li class="quid-thead-row ' , $row.attr('class') ,  '" '+ _attribute($row, 'style') , _attribute($row, 'id'),'>');
                            var children = $row.children();
                            var $child;
                            for(var x=0,cl=children.length;x<cl;x++){
                                    $child = $(children[x]);
                                    if( $child.data('class') ){
                                        colClasses[x] = $child.data('class');
                                        $child.addClass($child.data('class'));
                                    }
                                    // check for data model
                                    if( $child.data('model') ){
                                        data.model[x] = $child.data('model');
                                    } else {
                                        data.model[x] = 'none';
                                    }
                                    html.push('<span class="quid-thead-cell ' , $child.attr('class') , '" ', _attribute($child, 'style') ,' ', _attribute($child, 'id') , _attribute($child, 'data'),' ',_attribute($child, 'title'),'>');
                                    html.push($child.html(), '</span>');
                            }
                            html.push('</li>');
                    }
                    html.push('</ul>');
        
                    html.push('<ul class="quid-tbody ' , $tbody.attr('class') ,  '" ', _attribute($tbody, 'style') ,'>');
                    rows = $tbody.children();
                    for(var i=0,l=rows.length;i<l;i++){
                            $row = $(rows[i]);
                            html.push('<li ',_attribute($row, 'data'), ' class="quid-tbody-row ' , $row.attr('class') ,  '" ', _attribute($row, 'style') , '>');
                            var children = $row.children();
                            var $child;
                            for(var x=0,cl=children.length;x<cl;x++){
                                    $child = $(children[x]);
                                    if( colClasses[x] ){
                                        $child.addClass(colClasses[x]);
                                    }
                                    html.push('<span class="quid-tbody-cell ' , $child.attr('class') ,  '" ', _attribute($child, 'style') ,'>');
                                    html.push($child.html(), '</span>');
                            }
                            html.push('</li>');
                    }
                    html.push('</ul>');
                    html.push('</div>');
        
                    // replace the table
                    $n_grid = $(html.join(''));
                    $grid = $grid.replaceWith( $n_grid );
                    $grid = $n_grid;
                    
                    $thead = $grid.children('.quid-thead');
                    $tbody = $grid.children('.quid-tbody');
            
            
                    // calculate the total width of all columns;
                    var total = 0;
                    var first_cells = $('.quid-tbody-row:eq(0) .quid-tbody-cell', $tbody);
                    for(var i=0,l=first_cells.length;i<l;i++){
                        total = total + $(first_cells[i]).outerWidth();
                    }
            
                    $thead.addClass('ui-widget-header').children('.quid-thead-row').css({
                        'min-width': total + settings.scrollbarPadding
                    });
                    $tbody.addClass('ui-widget-content').children('.quid-tbody-row').css({
                        'min-width': total
                    });
                    
                    if( settings.stripe ){
                        _restripe($tbody);
                    }
                    
                    $('.quid-locked-cell', $tbody).addClass('ui-state-highlight');
            
                    // register for scrolling
                    var scrollTimeout;
                    var last_left = 0;
                    $tbody.scroll(function(){
                        var left = $tbody.scrollLeft();
                        if( last_left != left ){
                            $thead.find('.quid-thead-row').css({
                                'left': 0-left
                            });
            
                            clearTimeout(scrollTimeout);
                            scrollTimeout = setTimeout(function(){
                                $grid.find('.quid-locked-cell').css({
                                    'left' : left
                                });
                            }, settings.fixedScrollDelay);
            
                            last_left = left;
                        }
                    });
                    
                    // save the data
                    $grid.data('quid-grid', data);
                }
            });
        },
        appendRows : function(json, should_scroll){
            return this.each(function(){
             
                var $this = $(this)
                var data = $this.data('quid-grid');
                var settings = data.settings;
             
                //The grid hasn't been initialized yet
                if( data ) {
                    var $tbody = $this.children('.quid-tbody');
                    var model = data.model;
                    var rows = null;
                    if( json instanceof Array ){
                        rows = json;
                    } else if( typeof json == 'object' ) {
                        rows = [json];
                    }
                    var row, $row_dom, key, value, x;
                    for(r=0;r<rows.length;r++){
                        row = rows[r];
                        $row_dom = $tbody.children('.quid-tbody-row:first-child').clone();
                        key = null;
                        value = null;
                        x = 0;
                        for(i=0;i<model.length;i++){
                           key = data.model[i];
                           value = row[key];
                           x = i + 1;
                           if(typeof value != 'undefined' ){;
                                $row_dom.children('.quid-tbody-cell:nth-child('+x+')').html(value);  
                           } else {
                                $row_dom.children('.quid-tbody-cell:nth-child('+x+')').html('&nbsp;'); 
                           }
                        }
                        $tbody.append($row_dom);
                    }
                    if( settings.stripe ){
                        _restripe($tbody);
                    }
                    if(should_scroll){
                        if(typeof jQuery.scrollTo != 'undefined' ){
                            $tbody.scrollTo('max', 500, {axis:'y',easing:'swing'});
                        } else {
                            $tbody.scrollTop(100000);
                        }
                    }
                }
            });
        },
        hideColumn : function(model){
            return this.each(function(){
             
                var $this = $(this)
                var data = $this.data('quid-grid');
                var settings = data.settings;
             
                //The grid hasn't been initialized yet
                if( data ) {
                    var key, x;
                    for(i=0;i<model.length;i++){
                       key = data.model[i];
                       x = i + 1;
                       if(key == model ){;
                            $this.find('.quid-thead-row .quid-thead-cell:nth-child('+x+'), .quid-tbody-row .quid-tbody-cell:nth-child('+x+')').css({
                                display: 'none'
                            });
                            break;
                       }
                    }
                }
            });
        }
    };

    $.fn.quidGrid = function( method ) {
    
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.quidgrid' );
        }
        
    };
  
    $.fn.quidGrid.defaults = {
        scrollbarPadding : 17,
        stripe : true,
        fixedScrollDelay : 200
    };
  
  
    // private functions

    function _attribute($element, key){
        if( $element.attr(key) && $element.attr(key) != '' ){
            return [key, '="', $element.attr(key), '"'].join('');
        }
        return '';
    }
    
    function _restripe($tbody)
    {
        $tbody.children('.quid-tbody-row').removeClass('ui-state-highlight');
        $tbody.children('.quid-tbody-row:nth-child(3n)').addClass('ui-state-highlight');
    }

}(jQuery));
