/*
 * On document ready, prepare needed stuff
 */
$(document).ready(function(){
    getKBList();


    // prepare nav page on show
    $("#nav").bind("pagebeforeshow", function(){
        redrawNavigation();
    });
    
    // prepare instance list on show
    $("#instance-list").bind("pagebeforeshow", function(){
        redrawInstances();
    });
    
    // prepare properties list on show
    $("#properties-list").bind("pagebeforeshow", function(){
        redrawProperties();
    });
    
    // prepare search list on show
    $("#searchres-list").bind("pagebeforeshow", function(){
        var page = $("#searchres-list");
        page.page("destroy");
        page.page();
    });
    
    // prepare rdfa list on show
    $("#rdfa-list").bind("pagebeforeshow", function(){
        redrawRDFauthor();
    });
    
    $(document).bind("RDFauthor.added", function(){
        redrawRDFauthor();
    });
    
    // prepare page on navigation done
    $(document).bind("navigation.done", function(){        
        // redraw page
        redrawNavigation();
        
        // remove loader
        $.mobile.pageLoading(true);
    });
    
    
    // navigation buttons events
    // the link to the root
    $('.navFirst').live('click', function(event){
        provider.getNavigation('navigateRoot', selected_model);
        return false;
    })
    
    // the link to higher level
    $('.navBack').live('click', function(event){
        if(navigationStateSetup['state']['path'].length > 0){
            provider.getNavigation('navigateHigher', navigationStateSetup['state']['parent']);
        }else{
            provider.getNavigation('navigateHigher', selected_model);
        }
        return false;
    })
    
    
    
});