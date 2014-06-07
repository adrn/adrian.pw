var flickrUserId = '93815710@N02',
    flickrAPIKey = 'e66afe988bcf52593fc4e070b084cdaf';
function flickrPhotos() {
    var apiURL = 'https://api.flickr.com/services/rest/?&method=flickr.people.getPublicPhotos',
        baseSrcURL = 'http://farm{farm-id}.static.flickr.com/{server-id}/{photo-id}_{photo-secret}.jpg',
        baseLinkURL = 'http://www.flickr.com/photos/{user-id}/{photo-id}/';
    var fullURL = apiURL + '&api_key=' + flickrAPIKey;
    fullURL += '&user_id=' + flickrUserId;
    fullURL += '&per_page=100&page=1';

    $.ajax({
        url: fullURL,
        type: 'GET',
        dataType: "xml",
        async: true,
        success: function(xml) {
            //$("#recent-photos").empty();
            var srcURL, linkURL,
                n = 0,
                numImages = 6;

            $(xml).find("photo").each(function(i){
                if (Math.random() > 0.1) {
                    return;
                }

                srcURL = baseSrcURL.replace("{farm-id}", $(this).attr("farm"))
                                   .replace("{server-id}", $(this).attr("server"))
                                   .replace("{photo-id}", $(this).attr("id"))
                                   .replace("{photo-secret}", $(this).attr("secret"));
                linkURL = baseLinkURL.replace("{user-id}", flickrUserId)
                                     .replace("{photo-id}", $(this).attr("id"));

                var div = $('<div>');
                div.addClass("item");

                var img = $('<img>');
                img.attr('src', srcURL);

                var a = $('<a>');
                a.attr('href', linkURL);
                a.append(img);
                div.append(a);

                $("#photos .container").append(div);
                n += 1;

                if (n >= numImages) {
                    return false;
                }
            });

            //placePhotos();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            var p = $('<p>');
            p.html("Unable to retrieve photos!");
            p.addClass("error");
            $("#photos .container").append(p);
        }
    });
}

function placePhotos() {
    var $container = $('#photos .container');
    // $container.imagesLoaded( function() {
    //     $container.masonry({
    //         columnWidth: function( containerWidth ) {
    //             return containerWidth / 3;
    //         },
    //         itemSelector: '#photos .container img'
    //     });
    // });
    $container.masonry({
            columnWidth: function( containerWidth ) {
                return containerWidth / 3;
            },
            itemSelector: '#photos .container a img'
        });
}

function setupPhotos() {
    flickrPhotos();
}