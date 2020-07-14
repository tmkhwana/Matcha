function geoError(error) {
	if (error.code == 1) {
		$.get("https://ipinfo.io/", function (response) {
			// alert("If I want the location, I get the location::  " + response.loc);
			var ticks = response.loc;
			$.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + ticks
				+ "&key=AIzaSyDwMhLbkQbBk7091NEYpSx9T_ykXnwgPuI", function (place) {
					// console.log(place);
					ticks = ticks.split(',');
					// console.log(ticks);
					var jump = place.results[1]["formatted_address"].split(',');
					// console.log(jump);
					var res = {
						"street": jump[0].trim(),
						"city": jump[1].trim(),
						"postal_code": jump[2].trim(),
						"country": jump[3].trim(),
						"lat": ticks[0],
						"lon": ticks[1]
					}
					// console.log(res);
					$.ajax(
						{
							method: "POST",
							url: "savelocation.php",
							data: res
						}
					).done(function (res) {
						// alert(res);
					});
				}, "json");
		}, "json");
	} else if (error.code === 2) {
		// alert("location unavailable");
	} else {
		// alert("timeout");
	}
}


$(document).ready(function () {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			$.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude
				+ "&key=AIzaSyDwMhLbkQbBk7091NEYpSx9T_ykXnwgPuI", function (place) {
					var jump = place.results[3]["formatted_address"].split(',');
					var res = {
						"street": jump[0].trim(),
						"city": jump[1].trim(),
						"postal_code": jump[2].trim(),
						"country": jump[3].trim(),
						"lat": position.coords.latitude,
						"lon": position.coords.longitude
					}
					console.log(res);
					$.ajax(
						{
							method: "POST",
							url: "savelocation.php",
							data: res
						}
					).done(function (res) {
						// alert(res);
					});
				}, "json");
		}, geoError);

	} else {
		// alert("geolocation unsupported");
	}
});