var flickrUserId = '93815710@N02',
    flickrAPIKey = 'e66afe988bcf52593fc4e070b084cdaf';
function flickrPhotos() {
    var apiURL = 'https://api.flickr.com/services/rest/?&method=flickr.people.getPublicPhotos',
        baseSrcURL = 'http://farm{farm-id}.static.flickr.com/{server-id}/{photo-id}_{photo-secret}.jpg',
        baseLinkURL = 'http://www.flickr.com/photos/{user-id}/{photo-id}/';
    var fullURL = apiURL + '&api_key=' + flickrAPIKey;
    fullURL += '&user_id=' + flickrUserId;
    fullURL += '&per_page=5&page=1';

    $.ajax({
        url: fullURL,
        type: 'GET',
        dataType: "xml",
        async: true,
        success: function(xml) {
            //$("#recent-photos").empty();
            var srcURL, linkURL;
            $(xml).find("photo").each(function(i){
                srcURL = baseSrcURL.replace("{farm-id}", $(this).attr("farm"))
                                   .replace("{server-id}", $(this).attr("server"))
                                   .replace("{photo-id}", $(this).attr("id"))
                                   .replace("{photo-secret}", $(this).attr("secret"));
                linkURL = baseLinkURL.replace("{user-id}", flickrUserId)
                                     .replace("{photo-id}", $(this).attr("id"));

                var img = $('<img>');
                img.attr('src', srcURL);
                if (i == 0) {
                    img.addClass("active");
                }

                var a = $('<a>');
                a.attr('href', linkURL);
                a.append(img);

                $("#photos .container").append(a);
            });
        }
    });
}

function setupPhotos() {
    //flickrPhotos();
}