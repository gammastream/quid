(function( $ ){

    $.quid = {
        setPrimaryIcon : function(selector, icon){
            $.quid.setIcons(selector, icon, false);
        },
        setSecondaryIcon : function(selector, icon){
            $.quid.setIcons(selector, false, icon);
        },
        setIcons : function(selector, primary, secondary){
            var e = $(selector);
            var icons = e.button('option', 'icons');
            if( typeof primary == 'boolean' && primary == true ){
                icons.primary = null;   // nullify the icon
            } else if( typeof primary == 'string' ){
                icons.primary = primary;
            }
            if( typeof secondary == 'boolean' && secondary == true ){
                icons.secondary = null;   // nullify the icon
            } else if( typeof secondary == 'string' ){
                icons.secondary = secondary;
            }
            e.button('option', 'icons', icons);
        }
    };

}(jQuery));