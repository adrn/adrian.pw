var flickrUserId = '93815710@N02',
    flickrAPIKey = 'e66afe988bcf52593fc4e070b084cdaf';
function flickrPhotos() {
    var apiURL = 'https://api.flickr.com/services/rest/?&method=flickr.people.getPublicPhotos',
        baseSrcURL = 'http://farm{farm-id}.static.flickr.com/{server-id}/{photo-id}_{photo-secret}_b.jpg',
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
            var num = $(xml).find("photo").length,
                photoIdx = parseInt(Math.random()*num),
                photo = $($(xml).find("photo")[photoIdx]);

            var srcURL = baseSrcURL.replace("{farm-id}", $(photo).attr("farm"))
                                   .replace("{server-id}", $(photo).attr("server"))
                                   .replace("{photo-id}", $(photo).attr("id"))
                                   .replace("{photo-secret}", $(photo).attr("secret"));
            var linkURL = baseLinkURL.replace("{user-id}", flickrUserId)
                                     .replace("{photo-id}", $(photo).attr("id"));

            $('.flickr-panel').css("background-image",
                                   "url(" + srcURL + ")");

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            var p = $('<p>');
            p.html("Unable to retrieve Flickr photo");
            p.addClass("error");
            $("#photos .container .flickr-panel .float-link").append(p);
        }
    });
}

var iClientID = "236540640bea4323949fe1792f0261fe",
    iUserID = "19342634";
function instgramPhotos() {
    var instagramURL = "https://api.instagram.com/v1/users/{user-id}/media/recent?count={num}&client_id={client-id}";
    $.ajax({
        type: "GET",
        dataType: "jsonp",
        cache: false,
        url: instagramURL.replace("{client-id}", iClientID)
                         .replace("{user-id}", iUserID)
                         .replace("{num}", 100),
        success: function(data) {
            var cntr = $('#photos .container .instagram-panel'),
                num = data.data.length,
                photoIdx = parseInt(Math.random()*num);

            console.log(data.data[photoIdx].images);
            var srcURL = data.data[photoIdx].images.standard_resolution.url;

            $('.instagram-panel').css("background-image",
                                   "url(" + srcURL + ")");

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            var p = $('<p>');
            p.html("Unable to retrieve instragram photos");
            p.addClass("error");
            $("#photos .container .instagram-panel .float-link").append(p);
        }
    });
}

function setupPhotos() {
    flickrPhotos();
    instgramPhotos();
}