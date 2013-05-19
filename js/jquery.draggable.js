
/**
 * Draggable Plugin
 * Copyright (c) 2013 Elton Jain
 * http://jsfiddle.net/yelton/2TQgB/
 * Source: http://techchurian.wordpress.com/2013/02/21/lightweight-draggable-jquery-plugin/
 * @class draggable
 * @namespace jQuery
 */
$.fn.draggable=function(e){var t=this;var n={handle:"",cursor:"move",axis:null,containParent:false};e=$.extend(n,e);if(e.handle===""){var r=t}else{var r=t.find(e.handle)}return r.css("cursor",e.cursor).on("mousedown",function(t){if(e.handle===""){var n=$(this).addClass("draggable")}else{var n=$(this).addClass("active-handle").parent().addClass("draggable")}var i=n.css("z-index"),s=n.outerHeight(),o=n.outerWidth(),u=n.offset().top+s-t.pageY,a=n.offset().left+o-t.pageX;var f=$(this).parent();var l=f.width(),c=f.height();var h=parseInt(f.offset().left)+parseInt(f.css("padding-left").replace("px","")),p=h+l,d=parseInt(f.offset().top)+parseInt(f.css("padding-top").replace("px","")),v=d+c;n.css("z-index",1e3).parents().on("mousemove",function(t){var f=t.pageY+u-s,l=t.pageX+a-o,c=null;if(e.containParent===true){if(l<h)l=h;if(l>p-o)l=p-o;if(f<d)f=d;if(f>v-s)f=v-s}if(e.axis=="x"){c={left:l}}else if(e.axis=="y"){c={top:f}}else{c={left:l,top:f}}$(".draggable").offset(c);$(".draggable, html").on("mouseup",function(){n.parents().off("mousemove");$(r).removeClass("draggable").css("z-index",i)})});t.preventDefault()}).on("mouseup",function(){if(e.handle===""){$(this).removeClass("draggable")}else{$(this).removeClass("active-handle").parent().removeClass("draggable")}r.off("mousedown",function(e){e.preventDefault()})})}