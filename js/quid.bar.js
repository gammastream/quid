(function( $ ){

    var methods = {
        init : function( options ) {
            
            var settings = $.extend({}, $.fn.quidBar.defaults, options);
            
            return this.each(function(){
            
                var $toolbar = $(this);
                var $container = null;
                var data = $toolbar.data('quid-bar');
                
                // Has the toolbar been initialized?
                if( !data ) {
                    data = {};
                    
                    // Add the default CSS Classes
                    $toolbar.addClass('quid-bar ui-widget ui-widget-content');
                    
                    // We need to wrap everything so we can contain our floats with the inline-block;
                    $toolbar.wrapInner('<div class="quid-bar-container"/>');
                    $container = $toolbar.children();
                    // get each of the top level UL... they are an item group.
                    var $item_groups = $container.children('ul'); //.detach(); // may need to put back for performance
                    var item_group_count = $item_groups.length;
                    var $items = null;
                    var $item = null;
                    var total_width = 0;
                    $item_groups.each(function(index){
                        if( item_group_count > 1 && index == (item_group_count-1) ){
                            $(this).addClass('quid-bar-group quid-bar-group-last ui-buttonset');
                        } else {
                            $(this).addClass('quid-bar-group ui-buttonset');
                        }
                        // check the child list items for the appropriate type.
                        $items = $(this).children('li');
                        $items.each(function(){
                            $item = $(this).children(':first');
                            if( $item.is('a') ){
                                buildButtonItem($(this), $item);
                            } else if( $item.is('input') ){
                                $(this).addClass('quid-input-item');
                            } else {
                                $(this).addClass('quid-text-item');
                            }
                            total_width = total_width + this.offsetWidth;
                            $(this).data('quid-width', this.offsetWidth);
                        });
                    });
                    
                    $item_groups.appendTo($container);
                    $toolbar.css({
                        minWidth: total_width + settings.buffer
                    });
                    
                    // save the data
                    $toolbar.data('quid-bar', data);
                }
            });
        }
    };

    $.fn.quidBar = function( method ) {
    
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.quidbar' );
        }
        
    };
  
    $.fn.quidBar.defaults = {
        'buffer' : 50
        ,'menuFadeOutDelay' : 100
        ,'zIndex' : 10000
        ,'makeSquare' : true
        ,'checkMenuItemClass' : 'checked'
        ,'customIconClass' : null
        ,'isCollapsed' : false
    };
  
  
    // private functions
    function buildButtonItem($container, $item){
        var $menu = null;
        $container.addClass('quid-button-item');
        
        // hide any menus and add some classes to them.
        $menu = $container.children('ul').hide();
        if( $menu.data('direction') == 'up' ){
            $menu.addClass('quid-menu quid-menu-popup ui-widget ui-widget-content ui-corner-top');
        } else {
            $menu.addClass('quid-menu ui-widget ui-widget-content ui-corner-bottom');
        }
        var text = $item.data('text') != false;
        var p_icon = null;
        var s_icon = null;
        if( $(this).data('icon-position') == 'secondary' ){
            var s_icon = $item.data('icon');
        } else {
            var p_icon = $item.data('icon');
            var s_icon = $menu.length > 0 ? 'ui-icon-triangle-1-s' : null;
        }
        $item.button({
            text : text,
            icons : {
                primary: p_icon,
                secondary: s_icon
            }
        }).addClass('quid-button').removeClass('ui-corner-all');
        
        if( $item.data('confirm') ){
            $item.click(function(e){
                if( confirm($item.data('confirm')) ){
                    $item.trigger('click.confirmed');
                    return true;
                } else {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return false;
                }
            });
        } else {
            $item.click(function(e){
                $item.trigger('click.confirmed');
                return true;
            });
        }
           
        if( $menu.length > 0 ){
            // setup any sub-menus… this should only be done once if the menu is shown… 
            $menu.find('li').each(function(){
                var $subs = $(this).find('ul').hide().addClass('quid-menu ui-widget ui-widget-content ui-corner-bottom');
                var $menu_items = $(this).find('a').each(function(){
                    if( $(this).next().length > 0 ){
                        $(this).button({
                            icons: {secondary:'ui-icon-triangle-1-e'}
                        });
                    } else {
                        $(this).button();
                    }
                });
                $subs.mouseenter(function(){
                    $(this).stop(true, true);
                });
                $menu_items.removeClass('ui-corner-all').hover(function(e){
                    showMenu($(this).parent(), $(this).next(), false);
                },function(e){
                    hideMenu($(this).next());
                });
            });
            $menu.css({
                minWidth : $item.innerWidth(),
                zIndex : 10000
            });
            $menu.hover(function(){
                $(this).stop(true, true);
            }, function(){
                hideMenu($(this));
            });
            
            $item.hover(function(e){
                showMenu($(this).parent(), $menu, true);
            },function(e){
                hideMenu($menu);
            });
            /*
            $item.focusin(function(){
                $item.keydown(function(){
                    showMenu($(this).parent(), $menu, true);
                });
            }).focusout(function(){
                console.log('item focus out');
            });
            */
        }
    }
    
    function showMenu($container, $menu, is_main){
        $menu.stop(true, true);
        var my = 'left top';
        var at = 'right top';
        if( is_main ){
            if( $menu.data('direction') == 'up' ){  
                my = 'left bottom'
                at = 'left top';
            }  else {
                my = 'left top'
                at = 'left bottom';
            }
        }
        $menu.show().position({
            my: my,
            at: at,
            of: $container
        });
        
        //$menu.find('li:first-child').find('.ui-button').addClass('ui-state-active').focus();
    }
    
    function hideMenu($menu){
        $menu.add($menu.find('.quid-menu')).delay(300).hide('fast');
    }

}(jQuery));
