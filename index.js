
const ANIMATION_DURATION = 300;
const HOVER_DELAY = 400;
const SCROLL_OFFSET = 96;

let current = null;
let selectedProject = null;
let hoverTimeout = null;
let useHover = true, isInteractive = true;
let isAnimating = false;

function playVid(name, hideOverlay){
    
    const vid = $("#v" + name);
	const overlay = $("#" + name);

    overlay.attr("selected", true);

    if(!vid.length)
        return;

    vid.fadeIn(ANIMATION_DURATION);
    vid[0].play();

    if(hideOverlay)
        overlay.stop(true, true).animate({
            opacity: 0
        }, ANIMATION_DURATION);
}

function stopVid(name, hideOverlay){
    
    const vid = $("#v" + name);
	const overlay = $("#" + name);

    overlay.removeAttr("selected");

    if (hideOverlay) {
        overlay.stop(true, true).animate({
            opacity: 1
        }, ANIMATION_DURATION);
    }

    if (!vid.length)
		return;

    vid.fadeOut(ANIMATION_DURATION, function() {
        vid[0].pause();
        vid[0].currentTime = 0;
    });
}

function hideProject(){
	
    if (isAnimating)
		return;

    if(current != null)
        stopVid(current, true);

    if(selectedProject != null) {
		
		console.log("toggling isAnimating");
        isAnimating = true;
        selectedProject.slideUp(ANIMATION_DURATION, function() {
		console.log("toggling isAnimating = false");
            isAnimating = false;
        });
		
        selectedProject = null;
    }

}

function switchToProject(name, hideOverlay, sameIsToggle){
	
    if (isAnimating)
		return;
	
    if (current == name){

        if(sameIsToggle){
            hideProject();
            current = null;
        }
		
		else if(hideOverlay)
            $("#" + name).animate({
                opacity: 0
            });

        return;
    }
    
    const vid = $("#v" + name);

    // Calculate scroll position before hiding current project
    let scrollPosition = null;
    let previousProjectBottom = null;

    if (current != null) {
        const prevElement = $(`#${current}`).closest('.project');
        const prevInfo = prevElement.find('.projectInfo');
        if (prevInfo.is(':visible')) {
            previousProjectBottom = prevElement.offset().top + prevElement.outerHeight();
        }
    }

    hideProject();

    // Set up new project
    const projectElement = $(`#${name}`).closest('.project');
    selectedProject = projectElement.find('.projectInfo');
    current = name;

    // Show new project info
    isAnimating = true;
	console.log("toggling isAnimating");
    selectedProject.slideDown(ANIMATION_DURATION, function() {
        isAnimating = false;
		console.log("toggling isAnimating = false");

        // Smooth scroll to project after animation
        const targetElement = projectElement.find('section');
        let targetOffset = targetElement.offset().top - SCROLL_OFFSET;

        // Adjust scroll if we're below a previously opened project
        if (previousProjectBottom && targetOffset > previousProjectBottom) {
            const infoHeight = selectedProject.outerHeight();
            targetOffset -= infoHeight;
        }

        $('html, body').animate({
            scrollTop: targetOffset
        }, ANIMATION_DURATION);
    });

    if (vid.length == 0){
        if(hideOverlay)
            $("#" + name).stop(true, true).animate({
            opacity: 0
        }, ANIMATION_DURATION);
    } else
        playVid(current, hideOverlay);
}

function updateAspect(){
	
    $("video, .video").each(function() {
        const $parent = $(this).parent();
        const parentWidth = $parent.width();
        const parentHeight = $parent.height();

        if (parentWidth * 9 >= parentHeight * 16) {
            $(this).removeClass('heightVideo').addClass('widthVideo video');
        } else {
            $(this).removeClass('widthVideo').addClass('heightVideo video');
        }
    });
	
    const $resume = $("#resumePdf");
    $resume.height($resume.width() * 1.5);
}

$(function () {

    var params = new window.URLSearchParams(window.location.search);
    isInteractive = !params.has("static");

    if(!isInteractive)
        $(".projectInfo").show();

    //Showing current year

    if (new Date().getFullYear() != 2019)
        $(".year").replaceWith("2019 - " + new Date().getFullYear());

    //Handle video aspect (clamp to overlay size)

    setTimeout(updateAspect, 100);
    $(window).resize(updateAspect);

    //If you use a touch screen, the overlay is used as a video, otherwise it's a link

    var touchDevice = (navigator.maxTouchPoints || "ontouchstart" in document.documentElement);

    //Disable clicking on links when hidden

    $(".icon-link, .icon").click(function(e){
        if($(this).is("a") && $(this).parent().parent().parent().css("opacity") != 1)
            e.preventDefault();
        else
            e.stopPropagation();
    });

    if (touchDevice && isInteractive) {
        
        //Toggle tooltips if visible

        $('[data-toggle="tooltip"]').click(function () {
            if($(this).parent().parent().parent().css("opacity") == 1)
                $(this).tooltip("toggle");
        });

        //Playing and stopping videos
        $(".overlay").click(
            function (e) {
                var name = $(this).attr("id");
                switchToProject(name, true, false);
            }
        );

    } else if(isInteractive) {

        //Show tooltips

        // $('[data-toggle="tooltip"]').tooltip();

        $('[data-toggle="tooltip"]').hover(function(){
            if($(this).parent().parent().parent().css("opacity") == 1)
                $(this).tooltip("toggle");
        });

        //Videos as gifs

        $("body").scroll(function(){
            if(hoverTimeout != null){
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
        });

        $(".overlay").hover(
            function () {
                var name = $(this).attr("id");

                if(useHover && !isAnimating){
                    hoverTimeout = setTimeout(function(){
						if(!isAnimating)
							switchToProject(name, false, false);
                    }, HOVER_DELAY);
                }
            },
            function () {
                if(hoverTimeout != null){
                    clearTimeout(hoverTimeout);
                    hoverTimeout = null;
                }
            }
        );
		
        $(".overlay").click(
            function(){
                useHover = false;
                var name = $(this).attr("id");
                switchToProject(name, true, false);
				
                setTimeout(() => {
                    useHover = true;
                }, HOVER_DELAY);
            }
        )

    }

});