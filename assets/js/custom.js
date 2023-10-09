/* Custom JS */

const dayMap = {};
const dayOfWeekMap = {
    0: 'SUN',
    1: 'MON',
    2: 'TUE',
    3: 'WED',
    4: 'THU',
    5: 'FRI',
    6: 'SAT',
};
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "Sept", "October", "November", "December"
];
const twitchUserMap = {};

// hard-coded map to profile pictures since twitch require OAuth now for all APIs even getting images
const twitchUsernameToImageMap = {
    "meastoso": "meastoso.png",
    "arcane_arts": "arcane.png",
    "spofie": "sofie3.png",
    "tuatime": "Tua.png",
    "seika": "seikachu.png",
    "crev": "crev.png",
    "josgar": "jos.png",
    "brianricardo": "brian_ricardo.jpg",
    "pookajutsu": "pook2.png",
    "rahhzay": "Rahhzay.png",
    "tequilashots1500": "tequila2.png",
    "psirisluno": "Psiris.jpg",
    "chilifarmer": "Chili.png",
    "darianhart": "Darian.png",
    "deenialvt": "DeenialVT.png",
    "paopukomi": "Komi.png",
    "curiousjoi": "curiousjoi.png",
    "llamatodd": "todd.png",
    "rookuri": "rook.jpg",
    "mtqcapture": "mizz.png",
    "midnababy": "midna.jpg",
    "angelusdemonus": "angelus.png",
    "mo_ranes": "mo.png",
    "stal": "stal.png",
    "dejavudea": "dea2.png",
    "sarahjane": "sarah.jpg",
    "aiyanya": "aiyana.png"
}

function getTimeSuffix(d) {
    return d.getHours() >= 12 ? 'PM' : 'AM';
}

function getTime(d) {
    return (d.getHours() + 11) % 12 + 1;
}

function createNewEvent(calenderEvent) {
    const defaultDescription = '';
    const eventDescription = calenderEvent.description == undefined ? defaultDescription : calenderEvent.description;
    const newEvent = {
        'time1': getTime(new Date(calenderEvent.start.dateTime)) + ':00',
        'time2': getTimeSuffix(new Date(calenderEvent.start.dateTime)),
        'twitchName': calenderEvent.summary == undefined ? "TBD" : calenderEvent.summary,
        'twitchProfilePicUrl': '',
        'eventDescription': eventDescription,
        'startTime': new Date(calenderEvent.start.dateTime),
        'endDate': new Date(calenderEvent.end.dateTime)
    }
    return newEvent;
}

function createNewDayObj(dayOfWeek, dayOfMonth, monthName) {
    const newDay = {
        'dayOfWeek': dayOfWeek,
        'dayOfMonth': dayOfMonth,
        'monthName': monthName,
        'events': []
    }
    return newDay;
}

function getDayOfWeek(d) {
    return dayOfWeekMap[d.getDay()];
}

function getMonthName(d) {
    return monthNames[d.getMonth()];
}

function addNewEventToDayMap(newEvent) {
    // ensure the events array remains in-order
    const existingEvents = dayMap[newEvent.startTime.getDate()].events;
    if (!existingEvents.length) {
        existingEvents.push(newEvent);
    } else {
        // existingEvents are not empty, determine where to insert new event
        // 2, 7, 17, 22, 12 --> looking to insert index 2 (3rd number)
        let indexToInsert = 0;
        for (let i = 0; i < existingEvents.length; i++) {
            const existingEvent = existingEvents[i];
            if (existingEvent.startTime > newEvent.startTime) {
                break;
            } else {
                indexToInsert++;
            }
        }
        existingEvents.splice(indexToInsert, 0, newEvent);
    }
    dayMap[newEvent.startTime.getDate()].events = existingEvents;
}

function populateDayMap(calendarEventArr) {
    // create day objects
    if (!calendarEventArr) {
        console.log('No calender events returned, returning.');
        return;
    }
    for (let i = 0; i < calendarEventArr.length; i++) {
        const calendarEvent = calendarEventArr[i];
        if (!calendarEvent.start || !calendarEvent.end) {
            console.log('The following calendar event did not contain a start, end or summary:');
            console.log(calendarEvent);
            return;
        }
        const newEvent = createNewEvent(calendarEvent);
        // check if day object already exists for this day
        const startTime = new Date(calendarEvent.start.dateTime);
        let existingDay = dayMap[startTime.getDate()];
        if (!existingDay) {
            // it doesn't exist, create it first then add event to it
            existingDay = createNewDayObj(getDayOfWeek(startTime), startTime.getDate(), getMonthName(startTime));
            dayMap[startTime.getDate()] = existingDay;
        }
        // now add new event
        addNewEventToDayMap(newEvent);
    }
}

/**
 * Take the daysMap and create the set of day objects
 */
function populateDaysContainer() {
    // find <div class="days-container"> and add children to it
    const sortedDays = sortDays();
    //for (const day in dayMap) {
    for (let k = 0; k < sortedDays.length; k++) {
        //const dayObj = dayMap[day];
        const dayObj = sortedDays[k];
        const newDayElement = '<div class="day" data-day="' + dayObj.dayOfMonth + '">' +
            '<div class="day-name">' + dayObj.dayOfWeek + '</div>' +
            '<div class="day-date">' + dayObj.monthName + ' ' + dayObj.dayOfMonth + '</div>' +
            '</div>';
        $('.days-container').append(newDayElement);
    }
}

// TODO: this is hardcoded for 5.1, make generic PLZ don't be trash meastoso
function sortDays() {
	let sortedArr = [];
	// generic version if all days are in same month
    for (const day in dayMap) {
        const dayObj = dayMap[day];
        sortedArr.push(dayObj);
    }
	// first find the october days
	// for (const day in dayMap) {
	// 	const dayObj = dayMap[day];
	// 	if (dayObj.monthName === 'August' && parseInt(dayObj.dayOfMonth) > 12) {
	// 		sortedArr.push(dayObj);
	// 	}
	// }
	// // first find the october days
	// for (const day in dayMap) {
	// 	const dayObj = dayMap[day];
	// 	if (dayObj.monthName === 'Sept') {
	// 		sortedArr.push(dayObj);
	// 	}
	// }
	return sortedArr;
}

function createAndPopulateDayEventsContainers() {
    const sortedDays = sortDays();
    //for (const day in dayMap) {
    for (let k = 0; k < sortedDays.length; k++) {
        //const dayObj = dayMap[day];
        const dayObj = sortedDays[k];
        // TODO: AFTER BOK PLAY SORT THE DAYS AND THEN BUILD DOM
        // for each day make a new day-events-container
        const newDayEventsContainer = $('<div class="day-events-container" data-day="' + dayObj.dayOfMonth + '"></div>');
        // now loop through each event for this day and generate a new schedule-event row
        for (let i = 0; i < dayObj.events.length; i++) {
            const newEvent = dayObj.events[i];
            newDayEventsContainer.append('<div class="row schedule-event">' +
                '              <div class="event-time">' +
                '                <span class="schedule-event-time">' + newEvent.time1 + '</span><span class="schedule-event-time2">' + newEvent.time2 + '</span>' +
                '              </div>' +
                '              <div class="twitch-profile-pic">' +
                '                <img class="schedule-event-profile-pic" src="' + newEvent.twitchProfilePicUrl + '" data-twitch-name="' + newEvent.twitchName.trim().toLowerCase() + '"/>' +
                '              </div>' +
                '              <div class="event-description">' +
                '                <div class="streamer-name" data-name="' + newEvent.twitchName.trim().toLowerCase() + '">' + newEvent.twitchName + '</div>' +
                '                <div class="stream-description">' + newEvent.eventDescription + '</div>' +
                '                <div class="follow"><a target="_blank" href="https://twitch.tv/' + newEvent.twitchName + '">Follow on Twitch!</a></div>' +
                '              </div>' +
                '            </div>');
        }
        $('#schedule-section').append(newDayEventsContainer);
    }
}

function createClickHandler() {
    // now register the click handler
    $('.day').on('click', function() {
        let clickedDate = $(this).data('day');
        // remove selected class from all other days
        $('.day').each(function(index) {
            $(this).removeClass('selected');
        });
        $(this).addClass('selected');
        // Show the corresponding day events and hide all others
        $('.day-events-container').each(function(index) {
            if ($(this).data('day') == clickedDate) {
                $(this).fadeIn();
            }
            else {
                $(this).hide();
            }
        });
    });
    // click the first day or today's date
    // TODO: CLICK TODAY'S DATE AND SCROLL OVER IF TODAY'S DATE IS ON RIGHT SIDE
    $('.day').first().click();
}

// Workaround using profile images we have locally because twitch requires OAuth
function fetchProfileImages() {
    // asynchronously go and populate the profile images for each event
    // only call twitch once but include all the names we want to include
    let twitchUsernamesArr = [];
    // first get all the twitch usernames we care about
    $('.schedule-event-profile-pic').each(function(index) {
        let twitchName = $(this).data('twitchName');
        if (twitchName) {
        		twitchName = twitchName.trim().toLowerCase();
        }
        if (twitchUsernamesArr.indexOf(twitchName) < 0) {
            twitchUsernamesArr.push(twitchName);
        }
    });
    let apiUrl = 'https://api.twitch.tv/helix/users?login=';
    for (let i = 0; i < twitchUsernamesArr.length; i++) {
        let stringToAdd = twitchUsernamesArr[i];
        if (i > 0) stringToAdd = '&login=' + stringToAdd;
        apiUrl = apiUrl + stringToAdd;
    }
    const callComplete = function(response) {
        if (!response.data) {
            console.log('ERROR: We successfully completed the twitch getUser API call but response did not contain data object!');
        }
        for (let i = 0; i < response.data.length; i++) {
            const userObj = response.data[i];
            twitchUserMap[userObj.login] = userObj;
            // update the profile image URL
            $('.schedule-event-profile-pic[data-twitch-name="' + userObj.login + '"]').attr('src', userObj.profile_image_url);
            // now user the user object's display_name property to make sure capitalization and such are correct
            $('.streamer-name[data-name="' + userObj.login + '"]').text(userObj.display_name);
        }
    }
    $.ajax({
        url: apiUrl,
        type: 'GET',
        beforeSend: function(xhr){xhr.setRequestHeader('Client-ID', 'nogdjownnpxw2f464pxutwidsan0d6');},
        success: callComplete,
        error: function (error) {
            console.log('ERROR: Failed to get the user object from Twitch API with error:');
            console.log(error);
        }
    });

}

function fetchProfileImagesLocal() {
    let twitchUsernamesArr = [];
    // first get all the twitch usernames we care about
    $('.schedule-event-profile-pic').each(function(index) {
        let twitchName = $(this).data('twitchName');
        if (twitchName) {
            twitchName = twitchName.trim().toLowerCase();
        }
        if (twitchUsernamesArr.indexOf(twitchName) < 0) {
            twitchUsernamesArr.push(twitchName);
        }
    });
    twitchUsernamesArr.forEach(function(twitchUsername) {
        // update the profile image URL
        let imageFile = 'assets/img/rebrand/logomark4x.png';
        if (twitchUsernameToImageMap[twitchUsername]) {
            imageFile = 'assets/img/profile/' + twitchUsernameToImageMap[twitchUsername];
        }
        $('.schedule-event-profile-pic[data-twitch-name="' + twitchUsername + '"]').attr('src', imageFile);
        // now user the user object's display_name property to make sure capitalization and such are correct
        // $('.streamer-name[data-name="' + twitchUsername + '"]').text(twitchUsername);
    });
}

function createDomElements() {
    populateDaysContainer();
    createAndPopulateDayEventsContainers();
    createClickHandler();
    // fetchProfileImages();
    fetchProfileImagesLocal();
}

function populateLiveUserLink(liveUser) {
    $('#watchLiveLink').attr('href', 'https://www.twitch.tv/' + liveUser);
}

$( document ).ready(function() {
    $("#viewTeam").on('click', function() {
    	$("html, body").animate({ scrollTop: $('#teamContainer').offset().top }, 1000);
    });
    /** **********************************************************************
     * THIS IS A KILL SWITCH TO AUTOMATICALLY HIDE MARATHON SCHEDULE AFTER ITS DONE
     * TODO: Update this date for each marathon!!!!!!
     ***********************************************************************/
    const today = new Date();
    // TODO: Update this date here for each new marathon
    const lastMarathonDate = new Date('October 24, 2023 00:00:00');
    const firstMarathonDate = new Date('October 12, 2023 00:00:00');
    if (today < firstMarathonDate) {
        $("#watchLiveLink").hide();
    }
    if (today > lastMarathonDate) {
        // we are currently past marathon date, hide schedule
        $(".container.schedule").hide();
    } else {
        // current date is before marathon is done, let's include it
        var scheduleURI = 'https://twitch.meastoso-backend.com/schedule';
        var scheduleURI_test = 'http://localhost:3001/schedule';
        var scheduleRequest = $.getJSON(scheduleURI,
            function(response) {
                // first check if the Google OAUTH failed (tryagain)
                if (!response.errors) {
                    populateDayMap(response);
                    createDomElements();
                }
                else {
                    // there were errors, retry after 1-second delay to allow OATH to renew credentials :(
                    // TODO: fix the OATH garbage on back-end
                    setTimeout(function() {
                        var scheduleRequest2 = $.getJSON(scheduleURI,
                            function(response) {
                                // first check if the Google OAUTH failed (try again)
                                if (!response.errors) {
                                    populateDayMap(response);
                                    createDomElements();
                                }
                                else {
                                    // there were errors, oh well we really fucked up :(
                                    console.log('ERROR: MEGA-ERROR: Maybe we need to delay this a bit?');
                                    return;
                                }
                            })
                            .fail(function(err) {
                                console.log("ERROR: Could not retrieve calendar events a SECOND time:");
                                console.log(err);
                            })
                            .always(function() {
                                $('#scheduleLoadingSpinner').hide();
                            });
                    }, 1000);
                }
                if (!response.length) {
                    // no schedule yet; this is only relevant when setting up for marathon and the calendar isn't updated yet
                    $(".container.schedule").hide();
                }
            })
            .fail(function(err) {
                console.log("ERROR: Could not retrieve calendar events:");
                console.log(err);
            })
            .always(function() {
                $('#scheduleLoadingSpinner').hide();
            });

        // populate the LIVE NOW link
        var liveUserRequest = $.getJSON('https://twitch.meastoso-backend.com/liveUser',
            function(liveUser) {
                if (liveUser && liveUser != null) {
                    populateLiveUserLink(liveUser);
                }
                else {
                    console.log('ERROR: LiveUser endpoint returned "null"');
                }
            })
            .fail(function(err) {
                console.log("ERROR: Could not retrieve live user:");
                console.log(err);
            });

        $('#day-right-clicker').click(function() {
            event.preventDefault();
            $('.days-container').animate({
                scrollLeft: "+=300px"
            }, "slow");
        });

        $('#day-left-clicker').click(function() {
            event.preventDefault();
            $('.days-container').animate({
                scrollLeft: "-=300px"
            }, "slow");
        });
    }
});