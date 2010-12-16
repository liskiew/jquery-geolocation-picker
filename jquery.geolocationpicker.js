(function($) {

    //Attach this new method to jQuery
    $.fn.extend({

        //This is where you write your plugin's name
        geoPickerAndy: function(options) {

            var settings = {
                width: "300px",
                height: "200px",
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: 10,
                padding: 10,
                defaultLat: 52.229683,
                defaultLng: 21.012175,
                gMapMapTypeId: google.maps.MapTypeId.HYBRID,
                gMapZoom: 15,
                gMapMapTypeControl: false,
                gMapDisableDoubleClickZoom: true,
                gMapStreetViewControl: false,
                gMapMarkerTitle: "Drag me."

            };

            function RoundDecimal(num, decimals) {
                var mag = Math.pow(10, decimals);
                return Math.round(num * mag) / mag;
            }

            var geocoder = new google.maps.Geocoder();

            return this.each(function() {

                var that = this;

                settings = $.extend({ defaultAddressCallback: function() { return $(that).val();}}, settings, options);

                var visible = false;
                var id = $(this).attr('id');
                var pickerId = "picker-" + id;
                var mapDivId = "mapdiv-" + id;

                var picker = $("<div id='" + pickerId + "' class='pickermap'></div>").css({
                    width: settings.width,
                    backgroundColor: settings.backgroundColor,
                    border: settings.border,
                    padding: settings.padding,
                    borderRadius: settings.borderRadius,
                    position: "absolute",
                    display: "none"
                });

                var mapDiv = $("<div class='picker-map' id='" + mapDivId + "'>Loading</div>").css({
                    height: settings.height
                });


                $(this).after(picker);
                picker.append(mapDiv);

                var myLatlng = new google.maps.LatLng(settings.defaultLat, settings.defaultLng);

                var gMapOptions = {
                    zoom: settings.gMapZoom,
                    center: myLatlng,
                    mapTypeId: settings.gMapMapTypeId,
                    mapTypeControl: settings.gMapMapTypeControl,
                    disableDoubleClickZoom: settings.gMapDisableDoubleClickZoom,
                    streetViewControl: settings.gMapStreetViewControl
                };
                var map = new google.maps.Map(mapDiv.get(0), gMapOptions);

                var marker = new google.maps.Marker({
                    position: myLatlng,
                    map: map,
                    title: settings.gMapMarkerTitle,
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
                    $(that).val(lat + "," + lng);
                };


                function getCurrentPosition() {

                    var posStr = $(that).val();

                    if (posStr != "") {
                        var posArr = posStr.split(",");
                        if (posArr.length == 2) {
                            var lat = $.trim(posArr[0]);
                            var lng = $.trim(posArr[1]);
                            var latlng = new google.maps.LatLng(lat, lng);
                            setPosition(latlng);
                            return;
                        }
                    } else {
                        var address = "";

                        if (settings.defaultAddressCallback != null) {
                            address = settings.defaultAddressCallback();
                        }
                        geocoder.geocode(
                        {'address': address},
                                        function(results, status) {
                                            if (status == google.maps.GeocoderStatus.OK) {
                                                setPosition(
                                                        results[0].geometry.location,
                                                        results[0].geometry.viewport
                                                        );
                                            }
                                        });
                    }
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

                $(that).focus(function(event) {
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
                $(that).click(function(event) {
                    event.stopPropagation();
                });
            });

        }

    });

})(jQuery);


//        $('#geo').locationPicker();


