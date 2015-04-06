//Implementation of typeahead.js
//Typeahead courtesy of @bassjobsen (https://github.com/bassjobsen/Bootstrap-3-Typeahead)

$('#citySearch').typeahead({
    source: function(query, process) {
        $.get("/findCity/"+ query, function(data) {
            if (data) {
                return process(data);
            }
        });
    },
    minLength: 3,
    displayText: function(item) {
        return item.cityName + " - " + item.country.countryName;
    },
    afterSelect: function(item) {
        $('#citySearch').val("");
        window.location.href = "/weather/#/" + item.cityID;
    }
});
