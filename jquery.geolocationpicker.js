(function($) {

    //Attach this new method to jQuery
    $.fn.extend({

        //This is where you write your plugin's name
        geoLocationPicker: function(options) {

            var geocoder = new google.maps.Geocoder();

            var settings = {
                width: "300px",
                height: "200px",
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: 10,
                padding: 10,
                defaultLat: 52.229683, // Warsaw, Poland
                defaultLng: 21.012175, // Warsaw, Poland
                gMapMapTypeId: google.maps.MapTypeId.HYBRID,
                gMapZoom: 15,
                gMapMapTypeControl: false,
                gMapDisableDoubleClickZoom: true,
                gMapStreetViewControl: false,
                gMapMarkerTitle: "Here I am.",
                showPickerEvent: "focus",
                left: options.left,
                top: options.top
            };

            function RoundDecimal(num, decimals) {
                var mag = Math.pow(10, decimals);
                return Math.round(num * mag) / mag;
            }


            return this.each(function() {

                var _this = this;
                // merge default settings with options and default callback method
                settings = $.extend({
                    defaultAddressCallback: function() { return $(_this).val();},
                    defaultLocationCallback: function(lat, lng) {$(_this).val(lat + "," + lng);}
                }, settings, options);

                var visible = false;
                var id = $(this).attr('id');
                var pickerId = "picker-" + id;
                var mapDivId = "mapdiv-" + id;

                var picker = $("<div id='" + pickerId + "' class='picker-map'></div>").css({
                    width: settings.width,
                    backgroundColor: settings.backgroundColor,
                    border: settings.border,
                    padding: settings.padding,
                    borderRadius: settings.borderRadius,
                    position: "absolute",
                    display: "none",
                    left: settings.left,
                    top: settings.top
                });

                var mapDiv = $("<div class='picker-map-div' id='" + mapDivId + "'>Loading</div>").css({
                    height: settings.height
                });


                $(this).after(picker);
                picker.append(mapDiv);

                
                var defaultLocationLatLng = new google.maps.LatLng(settings.defaultLat, settings.defaultLng);
//                    $(_this).val(lat + "," + lng);<

                var gMapOptions = {
                    zoom: settings.gMapZoom,
                    center: defaultLocationLatLng,
                    mapTypeId: settings.gMapMapTypeId,
                    mapTypeControl: settings.gMapMapTypeControl,
                    disableDoubleClickZoom: settings.gMapDisableDoubleClickZoom,
                    streetViewControl: settings.gMapStreetViewControl
                };
                
                var map = new google.maps.Map(mapDiv.get(0), gMapOptions);

                var marker = new google.maps.Marker({
                    title: settings.gMapMarkerTitle,
                    map: map,
                    position: defaultLocationLatLng,
                    draggable: true
                });


                google.maps.event.addListener(map, 'dblclick', function(event) {
                    setPosition(event.latLng);
                });

                google.maps.event.addListener(marker, 'dragend', function(event) {
                    setPosition(marker.position);
                });


                var setPosition = function(latLng, viewport) {
                    var lat = RoundDecimal(latLng.lat(), 6);
                    var lng = RoundDecimal(latLng.lng(), 6);
                    
                    marker.setPosition(latLng);
                    
                    if (viewport) {
                        map.fitBounds(viewport);
                        map.setZoom(map.getZoom() + 2);
                    } else {
                        map.panTo(latLng);
                    }

                    settings.defaultLocationCallback(lat, lng);
                };


                function getCurrentPosition() {

                    var posStr = $(_this).val();

                    if (posStr != "") {
                        var posArr = posStr.split(",");
                        if (posArr.length == 2) {
                            var lat = $.trim(posArr[0]);
                            var lng = $.trim(posArr[1]);
                            var latlng = new google.maps.LatLng(lat, lng);
                            setPosition(latlng);
                            return;
                            
                        }
                    }
                    
                    resolveAddress();
                              
                  }
                
                function resolveAddress(){
                    var address = "";
                        
                    // try to call callback function for default address
                    if (settings.defaultAddressCallback != null) {
                        address = settings.defaultAddressCallback();
                    }
                    geocoder.geocode({'address': address},
                      function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                          setPosition(results[0].geometry.location, results[0].geometry.viewport );
                        }
                      }
                    );
                }

                function hidePicker() {
                    picker.fadeOut('fast');
                    visible = false;
                }

                function showPicker() {
                    picker.fadeIn('fast');
                    google.maps.event.trigger(map, 'resize');
                    getCurrentPosition();
                    map.setCenter(marker.position);
                    visible = true;
                }
                
                $(_this).keydown(function(event) {
                    if (event.keyCode == '13' || event.keyCode == '10') { // enter
                        resolveAddress();
                    }
                });

                $(_this).bind(settings.showPickerEvent, function(event) {
                    if (!visible) {
                        showPicker();
                    }
                    event.stopPropagation();
                });

                $('html').click(function() {
                    hidePicker();
                });

                $(picker).click(function(event) {
                    event.stopPropagation();
                });
                $(_this).click(function(event) {
                    event.stopPropagation();
                });
            });

        }

    });

})(jQuery);

//        $('#geo').geoLocationPicker();


