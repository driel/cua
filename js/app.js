var currentDeleteBtn, currentOrderBtn;
var canvas, canvasSource, canvasDest, canvasDraw;
var contextSource, contextDest, contextDraw;
var selectedTool = 'brush', lineWidth = 10;
var slider;
var drawStates = [], step = -1;
var img_src, imgFormat = 'jpg', imgQuality = 0.9; // jpeg | png
jQuery(function($){
	// var screenW = window.innerWidth;

	// if(screenW >= 320 && screenW <= 479){
	// 	var canvasWidth = screenW - 40;
	// 	$('.modal-lg').css({
	// 		width: '100%',
	// 		margin: '0'
	// 	});

	// 	$('#main-canvas').attr({
	// 		width: canvasWidth+'px',
	// 		height: '160px'
	// 	});
	// }

	function resetModalWidth(){
		var screenW = window.innerWidth;

		if(screenW >= 320 && screenW <= 767){
			var ratio = 1/2;
			var canvasWidth = screenW - 40;
			var canvasHeight = canvasWidth * ratio;
			$('.modal-lg').css({
				width: '100%',
				margin: '0'
			});

			$('#main-canvas').attr({
				width: canvasWidth+'px',
				height: canvasHeight+'px'
			});
		}else{
			$('.modal-dialog').css({
				width: '1024px'
			});
		}
	}

	resetModalWidth();

	$('#photo-app').on('shown.bs.modal',function(){

		slider = $('.bxslider').bxSlider({
			pager: false,
			minSlides: 6,
			maxSlides: 6,
			slideWidth: 140
		});

		$('.bxslider>li>img').draggable({
			appendTo: 'body',
			helper: 'clone',
			cursorAt: {left: 0, top: 0}
		});


		canvas = new fabric.Canvas('main-canvas');
		fabric.Object.prototype.transparentCorners = false;
		canvas.setBackgroundImage('images/background/default.jpg', function(){
			canvas.renderAll();
		}, {
			width: canvas.width,
			height: canvas.height
		});

		canvas.on("object:selected", function(obj){
			$(".deleteBtn").remove(); jQuery(".zOrderBtn").remove();
			var deleteLeft = Math.floor(obj.target.oCoords.bl.x) - 10;
			var deleteTop = Math.floor(obj.target.oCoords.bl.y) - 15;
			var orderLeft = Math.floor(obj.target.oCoords.tr.x) - 10;
			var orderTop = Math.floor(obj.target.oCoords.tr.y) - 20;
			var deleteBtn = '<img src="images/delete.png" class="deleteBtn" title="Delete" style="position:absolute;top:'+deleteTop+'px;left:'+deleteLeft+'px;cursor:pointer; width: 32px; height:32px" />';
			var zOrderBtn = '<img src="images/stack.png" class="zOrderBtn" title="Order" style="position:absolute;top:'+orderTop+'px;left:'+orderLeft+'px;cursor:pointer; width: 32px; height:32px" />';
			$("#canvas-wrap").append(deleteBtn);
			$("#canvas-wrap").append(zOrderBtn);
			currentDeleteBtn = $('.deleteBtn').eq(0);
			currentOrderBtn = $('.zOrderBtn').eq(0);
		});

		canvas.on('selection:cleared', function(obj){
			$(".deleteBtn").remove(); jQuery(".zOrderBtn").remove();
		});

		$('#main-canvas').droppable({
			drop: function(e, ui){
				console.log(e, ui);
				var left = e.pageX - $('#canvas-wrap').offset().left;
				var top = e.pageY - $('#canvas-wrap').offset().top;
				console.log(left, top);
				var img = ui.draggable[0].src;
				fabric.Image.fromURL(img, function(theImg){
					canvas.add(theImg.set({
						'left': left,
						'top': top
					}));
					canvas.setActiveObject(theImg);

					theImg.on('rotating', function(){
						currentDeleteBtn.hide();
						currentOrderBtn.hide();
					});
					
					theImg.on('scaling', function(){
						currentDeleteBtn.hide();
						currentOrderBtn.hide();
					});
					
					theImg.on('moving', function(){
						isMoving = true;
						currentDeleteBtn.hide();
						currentOrderBtn.hide();
					});

					theImg.on('modified', function(e){
						var btnTop = theImg.oCoords.bl.y - 15;
	                    var btnLeft = theImg.oCoords.bl.x - 10;
	                    
	                    var orderTop = theImg.oCoords.tr.y - 20;
	                    var orderLeft = theImg.oCoords.tr.x - 10
						
						currentDeleteBtn.show().css({
							"top":Math.floor(btnTop),
							"left":Math.floor(btnLeft),
							"transform": 'rotate('+theImg.angle+'deg)'
						});
						currentOrderBtn.show().css({
							"top":Math.floor(orderTop),
							"left":Math.floor(orderLeft),
							"transform": 'rotate('+theImg.angle+'deg)'
						});
					});
				});
			}
		});

		/*
		** DELETE BUTTON
		*/
		$('body').on('tap mouseup', '.deleteBtn', function(){
			canvas.remove(canvas.getActiveObject());
			$(this).remove();
			$('.zOrderBtn').remove();
			$(".rotateBtn").remove();
		});
		
		/*
		** STACK BUTTON
		*/
		$('body').on('tap mouseup', '.zOrderBtn', function(e){
			var top = e.pageY;
			var left = e.pageX;

			if($("#context").length == 0){
				var context = $('<div id="context" />').appendTo('body');
			}

			var menu = '<ul><li><a id="front" href="" class="order-action">Bring to Front</a></li><li><a id="back" href="" class="order-action">Send to Back</a></li></ul>';
			$("#context").hide().css({
				top: top,
				left: left
			});

			$("#context").show().html(menu);

			if(navigator.userAgent.match(/ipad|iphone/i)){
				$(".order-action").css({
					'font-size':'22px'
				})
			}

			$("body").on("tap click", ".order-action", function(e){
				e.preventDefault();
				var action = $(this).attr("id");
				if(action == "front"){
					canvas.getActiveObject().bringToFront();
				}else{
					canvas.getActiveObject().sendBackwards();
				}
				
				$("#context").hide();
			});
		});

		$(document).on('mousedown', function(e){
			if(e.target.id != "context" && $("#context").is(":visible") && $(e.target).parents("#context").length == 0){
				$("#context").hide();
			}
			//return false;
		});

		$('a.paintbrush').on("click", function(e){
			var brushSize = $(this).attr("id");
			selectedTool = $(this).data("tools");
			$(".paintbrush").removeClass("shadow");
			switch(brushSize){
				case "small-paint":
				case "small-eraser":
					lineWidth = 10;
					break;
				case "medium-paint":
				case "medium-eraser":
					lineWidth = 20;
					break;
				case "large-paint":
				case "large-eraser":
					lineWidth = 30;
					break;
					
				default:
					lineWidth = 10;
					break;
			}
			$(this).addClass("shadow");
			e.preventDefault();
		});

		/*
		 * Undo & Redo routine
		 * */
		$("#undo").on("click", function(e){
			e.preventDefault();
			contextDraw.globalCompositeOperation = contextDest.globalCompositeOperation = "source-over";
			if(step > 0){
				step--;
				var drawImg = new Image();
				drawImg.src = drawStates[step][0];
				drawImg.width = canvasDraw.width;
				drawImg.height = canvasDraw.height;
				drawImg.onload = function(){
					contextDraw.clearRect(0, 0, canvasDraw.width, canvasDraw.height);
					contextDraw.drawImage(drawImg, 0, 0);
				}
				var copyImg = new Image();
				copyImg.src = drawStates[step][1];
				copyImg.width = canvasDest.width;
				copyImg.height = canvasDest.height;
				copyImg.onload = function(){
					contextDest.clearRect(0, 0, canvasDest.width, canvasDest.height);
					contextDest.drawImage(copyImg, 0, 0);
				}
			}
		});
		
		$("#redo").on("click", function(e){
			e.preventDefault();
			contextDraw.globalCompositeOperation = contextDest.globalCompositeOperation = "source-over";
			if(step < drawStates.length - 1){
				step++;
				var drawImg = new Image();
				drawImg.src = drawStates[step][0];
				drawImg.width = canvasDraw.width;
				drawImg.height = canvasDraw.height;
				drawImg.onload = function(){
					contextDraw.clearRect(0, 0, canvasDraw.width, canvasDraw.height);
					contextDraw.drawImage(drawImg, 0, 0);
				}
				var copyImg = new Image();
				copyImg.src = drawStates[step][1];
				copyImg.width = canvasDest.width;
				copyImg.height = canvasDest.height;
				copyImg.onload = function(){
					contextDest.clearRect(0, 0, canvasDest.width, canvasDest.height);
					contextDest.drawImage(copyImg, 0, 0);
				}
			}
		});

		// cancel crop
		$("#cancel-crop").on("click", function(e){
			e.preventDefault();
			$('.modal-dialog').css({
				width: '1024px'
			});
			$('.hide-default').hide();
			$('.show-default, .bx-wrapper').show();
			resetTitle();

			contextDraw.clearRect(0, 0, canvasDraw.width, canvasDraw.height);
			contextDest.clearRect(0, 0, canvasDest.width, canvasDest.height);
		});

		// upload another
		$("#upload-another").on("click", function(e){
			e.preventDefault();
			$("#photo-upload").click();
		});


		/*
		** PHOTO UPLOAD
		*/
		$('#photo-upload').on('change', function(ui){
			var reader = new FileReader();
			var target = ui.target;
			reader.onload = function(e){
				if(e.target.result.match("image/jpeg") 
				|| e.target.result.match("image/jpg") 
				|| e.target.result.match("image/png") 
				|| e.target.result.match("image/bmp")
				|| e.target.result.match("image/x-windows-bmp")
				|| e.target.result.match("image/gif")){ // only image should proceed
					var dimension = {}
					var img = new Image();
					img.src = e.target.result;
					img.onload = function(){
						dimension.width = this.width;
						dimension.height = this.height;
						cropPet(e.target.result, dimension);
					}
				}else{
					alert("sorry, only jpg, png, gif, bmp is supported.");
				}
			}
			reader.readAsDataURL(target.files[0]);
		});

		/*
		** MASKING
		*/
		var mousedown = false;
		var device = navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i)  == null ? 'click':'touch';
		var event = {
			"click":["mousedown", "mousemove", "mouseup"],
			"touch":["touchstart", "touchmove", "touchend"]
		};
		$("#canvas-draw").on(event[device][0], function(e){
			mousedown = true;
			var pageX = device == 'touch' ? e.originalEvent.touches[0].pageX:e.pageX;
			var pageY = device == 'touch' ? e.originalEvent.touches[0].pageY:e.pageY;
			var x = pageX - $("#canvas-source").offset().left;
			var y = pageY - $("#canvas-source").offset().top;
			contextDraw.lineWidth = contextDest.lineWidth = lineWidth;
			contextDraw.lineCap = contextDest.lineCap = 'round';
			contextDraw.lineJoin = contextDest.lineJoin = 'round';
			//contextDraw.globalCompositeOperation = contextDest.globalCompositeOperation = "source-over";
			
			if(selectedTool == "brush"){
				contextDraw.strokeStyle = 'rgba(255, 0, 0, 0.2)'; 
				contextDraw.beginPath();
				contextDraw.moveTo(x, y);
			}else{
				//contextDraw.beginPath();
				//contextDest.beginPath();
			}
		});

		$("#canvas-draw").on(event[device][1], function(e){
			if(device == 'touch'){
				e.preventDefault();
			}
			var pageX = device == 'touch' ? e.originalEvent.touches[0].pageX:e.pageX;
			var pageY = device == 'touch' ? e.originalEvent.touches[0].pageY:e.pageY;
			var x = parseInt(pageX - $("#canvas-source").offset().left);
			var y = parseInt(pageY - $("#canvas-source").offset().top);	
			if(mousedown){
				if(selectedTool == "brush"){
					contextDraw.lineTo(x, y);
					contextDraw.stroke();

					// this script will cause the path a bit transparent, lowering alpha channel for every pixels
					var ctxData = contextDraw.getImageData(0, 0, canvasDraw.width, canvasDraw.height);
					for(var i = 0; i<ctxData.data.length; i+=4){
						if(ctxData.data[i] == 0 && ctxData.data[i+1] == 0 && ctxData.data[i+2] == 0){
							ctxData.data[i+3] = 0;
						}else{
							ctxData.data[i+3] = 150;
						}
					}
					contextDraw.putImageData(ctxData, 0, 0);
					
					// copy image data to secondary canvas
					// var pixelData = contextSource.getImageData(x - (lineWidth/2), y - (lineWidth/2), lineWidth, lineWidth);
					// var tmpCanvas = document.createElement('canvas');
					// tmpCanvas.width = tmpCanvas.height = lineWidth;
					// var tmpContext = tmpCanvas.getContext('2d');

					// tmpContext.putImageData(pixelData, 0, 0);

					// contextDest.save();
					// contextDest.arc(x, y, (lineWidth/2), 0, 2*Math.PI);
					// contextDest.clip();
					// contextDest.drawImage(tmpCanvas, x - (lineWidth/2), y - (lineWidth/2));
					// contextDest.restore();

					// copy image data to secondary canvas
					var pixelData = contextSource.getImageData(x - (lineWidth/2), y - (lineWidth/2), lineWidth, lineWidth);
					contextDest.putImageData(pixelData, x - (lineWidth/2), y - (lineWidth/2));

				}else if(selectedTool == "eraser"){
					contextDraw.clearRect(x, y, lineWidth, lineWidth);
					contextDest.clearRect(x, y, lineWidth, lineWidth);
				}
			}
		});
		
		$("#canvas-draw").on(event[device][2], function(e){
			mousedown = false;
			if(selectedTool == "brush") contextSource.closePath();
			
			if(selectedTool == 'brush' || selectedTool == 'eraser'){
				step++;
				if(step < drawStates.length){
					drawStates.length = step;
				}
				drawStates.push([canvasDraw.toDataURL(), canvasDest.toDataURL()]);
			}
		});

		/*
		** PAINTBUCKET
		*/
		$("#canvas-draw").on("click touchstart", function(e){
			if(selectedTool != 'pbucket') return false;
			
			var pageX = device == 'touch' ? e.originalEvent.touches[0].pageX:e.pageX;
			var pageY = device == 'touch' ? e.originalEvent.touches[0].pageY:e.pageY;
			var x = parseInt(pageX - $("#canvas-source").offset().left);
			var y = parseInt(pageY - $("#canvas-source").offset().top);
			var r = 255, g = 0, b = 0;
			var cwidth = canvasDraw.width, cheight = canvasDraw.height;
			var layerData = contextDraw.getImageData(0, 0, cwidth, cheight);
			var layerDataOri = contextSource.getImageData(0, 0, canvasSource.width, canvasSource.height);
			var layerDataCopy = contextDest.getImageData(0, 0, canvasDest.width, canvasDest.height);
			var pps = [];

			var match = function(pp){ // pp = pixelPos
				var lr = layerData.data[pp];
				var lg = layerData.data[pp + 1];
				var lb = layerData.data[pp + 2];
				var ac = layerData.data[pp + 3]; // alpha channnel
				if(lr == r && lg == g && lb == b) return false; // match newColor, skip
				if(lr == 0 && lg == 0 && lb == 0) return true;
			}
			
			var colorPixel = function(pp){ // pp = pixelPos
				//pps.push(pp);
				layerData.data[pp] = r;
				layerData.data[pp + 1] = g;
				layerData.data[pp + 2] = b;
				layerData.data[pp + 3] = 150;
			}
			
			var oriToCopy = function(){
				while(pps.length > 0){
					var pp = pps.pop();
					layerDataCopy.data[pp] = layerDataOri.data[pp];
					layerDataCopy.data[pp + 1] = layerDataOri.data[pp + 1];
					layerDataCopy.data[pp + 2] = layerDataOri.data[pp + 2];
					layerDataCopy.data[pp + 3] = 255;
				}
				contextDest.putImageData(layerDataCopy, 0, 0);
			}

			var scan = function(x, y){
				stack = [[x, y]];
				while(stack.length > 0){
					var newPos, pixelPos, x, y, rl, rr;
					newPos = stack.pop();
					x = newPos[0];
					y = newPos[1];
					
					pixelPos = (y * cwidth + x) * 4;
					while(y-- >= 0 && match(pixelPos)){
						pixelPos -= cwidth * 4;
					}
					pixelPos += cwidth * 4;
					++y;
					rr = false;
					rl = false;
					while(y++ < cheight - 1 && match(pixelPos)){
						colorPixel(pixelPos);
						pps.push(pixelPos);
						if(x > 0){
							if(match(pixelPos - 4)){
								if(!rl){
									stack.push([x - 1, y]);
									rl = true;
								}
							}else if(rl){
								rl = false;
							}
						}
						
						if(x < cwidth - 1){
							if(match(pixelPos + 4)){
								if(!rr){
									stack.push([x + 1, y]);
									rr = true;
								}
							}else if(rr){
								rr = false;
							}
						}
						
						pixelPos += cwidth * 4;
					}
				}
				contextDraw.putImageData(layerData, 0, 0);
				oriToCopy();
				if(selectedTool == 'pbucket'){
					step++;
					if(step < drawStates.length){
						drawStates.length = step;
					}
					drawStates.push([canvasDraw.toDataURL(), canvasDest.toDataURL()]);
				}
			}
			scan(x, y);
		});

		function cropPet(image, dimension){
			$('.hide-default').show();
			$('.show-default, .bx-wrapper').hide();

			$('.modal-dialog').animate({
				width: '1200px'
			});

			// set title
			$('.modal-title').html('Use the "paintbrush" to outline & color in the part of the photo you would like to clip. use the "fill" tool to color in large areas and the "eraser" to make corrections.');

			var img = new Image();
			img.onload = function(){
				canvasSource = document.getElementById('canvas-source');
				contextSource = canvasSource.getContext('2d');

				canvasDest = document.getElementById('canvas-dest');
				contextDest = canvasDest.getContext('2d');

				canvasDraw = document.getElementById('canvas-draw');
				contextDraw = canvasDraw.getContext('2d');

				step++;
				if(step < drawStates.length){
					drawStates.length = step;
				}
				drawStates.push([canvasDraw.toDataURL(), canvasDest.toDataURL()]);

				/*
				** RESIZE UPLOADED PHOTO
				*/
				var maxWidth = 550;
				var w = dimension.width;
				var h = dimension.height;
				if(w > maxWidth){
					var ratio = maxWidth / w;
					w *= ratio;
					h *= ratio;
				}

				canvasSource.width = canvasDest.width = canvasDraw.width = w - 10;
				canvasSource.height = canvasDest.height = canvasDraw.height = h;

				contextSource.drawImage(img, 0, 0, w, h);
			};
			img.src = image;
		}

		/*
		** DONE CLIPPING
		*/
		$("body").on("click", "#done-clip", function(){
			var dataURL = canvasDest.toDataURL();
			var img = new Image();
			var cropCanvas = document.createElement("canvas");
			var boundingBox = getBoundingBox();
			cropCanvas.width = boundingBox.right - boundingBox.left;
			cropCanvas.height = boundingBox.bottom - boundingBox.top;
			var cropCtx = cropCanvas.getContext("2d");
			img.onload = function(){
				/*
				 * fit to content
				 * set destination to negative of maxLeft & maxTop
				 * and canvas dimension is maxRight - maxLeft & maxBottom - maxTop
				 * */
				cropCtx.drawImage(this, -boundingBox.left, -boundingBox.top); 
				
				/*
				 * again convert to dataURL
				 * apply to slider and store in array
				 * */
				var trueDataUrl = cropCanvas.toDataURL();
				var trueImg = new Image();
				trueImg.width = 105;
				trueImg.onload = function(){
					$('.bxslider').append('<li><img src="'+trueImg.src+'"></li>');
					slider.reloadSlider();

					$(".bxslider img").draggable({
						appendTo: 'body',
						helper: 'clone',
						cursorAt: {left: 0, top: 0}
					});
					
					// var pets = {
					// 		data: trueDataUrl,
					// 		image: trueImg
					// }
					// myPets.push(pets);
				}
				trueImg.src = trueDataUrl;
				// clear all edit canvas then revert to main canvas
				contextSource.clearRect(0, 0, canvasSource.width, canvasSource.height);
				contextDraw.clearRect(0, 0, canvasDraw.width, canvasDraw.height);
				contextSource.clearRect(0, 0, canvasDest.width, canvasDest.height);
				$('.modal-dialog').css({
					width: '1024px'
				});
				$('.hide-default').hide();
				$('.show-default, .bx-wrapper').show();
				resetTitle();
			}
			img.src = dataURL;
		});

		/*
		** GET BOUNDING BOX
		*/
		function getBoundingBox(){
			var cw = canvasDest.width;
			var ch = canvasDest.height;
			var top = ch;
			var right = 0;
			var bottom = 0;
			var left = cw;

			var imageData = contextDest.getImageData(0, 0, cw, ch);
			var data = imageData.data;
			for(var x = 0; x < cw; x++){ // from top to bottom;
				for(var y = 0; y < ch; y++){
					var pixelPos = (y * cw + x) * 4;
					if(data[pixelPos + 3] != 0){ // only check alpha channel
						if(y < top){
							top = y;
						}
					}
				}
			}

			for(var y = 0; y < ch; y++){ // from right to left
				for(var x = 0; x < cw; x++){
					var pixelPos = (y * cw + x) * 4;
					if(data[pixelPos + 3] != 0){
						if(x > right){
							right = x;
						}
					}
				}
			}

			for(var x = 0; x < cw; x++){
				for(var y = 0; y < ch; y++){
					var pixelPos = (y * cw + x) * 4;
					if(data[pixelPos + 3] != 0){
						if(y > bottom){
							bottom = y;
						}
					}
				}
			}

			for(var y = 0; y < ch; y++){
				for(var x = 0; x < cw; x++){
					var pixelPos = (y * cw + x) * 4;
					if(data[pixelPos + 3] != 0){
						if(x < left){
							left = x;
						}
					}
				}
			}

			return {"top": top, "right": right, "bottom": bottom, "left": left};
		}


	}).on('hidden.bs.modal', function(){
		canvas.clear();
		var main_canvas = $('#main-canvas').clone();
		$('.canvas-container').remove();
		$(main_canvas).insertBefore('#button-wrap');
		resetModalWidth();
		$('.hide-default, #share').hide();
		$('.show-default, .bx-wrapper').show();
		
	});

	$('#next-step').on('click', function(e){
		e.preventDefault();
		img_src = canvas.deactivateAll().toDataURL({
			format: imgFormat,
    		quality: imgQuality
		});
		$(".deleteBtn").remove(); jQuery(".zOrderBtn").remove();
		$('#image-result').attr('src', img_src);
		$('#image-data').val(img_src);

		$('.modal-title').html('Share Your Pic with Friends!');
		$('.show-default, .bx-wrapper').hide();
		$('#share').show();
	});

	$('#go-back').on('click', function(e){
		e.preventDefault();
		resetTitle();
		$('.hide-default, #share').hide();
		$('.show-default, .bx-wrapper').show();
	});

	$('#save2desktop, #save2desktopInstagram').on('click', function(){
		$('#save-image').submit();
	});

	$('#post2twitter').on('click', function(){
		$('#twitter-image-data').val(img_src);
		$('#twitter-update').submit();
	});

	function resetTitle(){
		$('.modal-title').html('Use the items below to customize your picture. Use the handles to resize or rotate.');
	}
});