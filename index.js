const movieURL = 'https://www.omdbapi.com/'
const movieIds = ['tt8367814', 'tt1375666', 'tt1160419', 'tt0087332', 'tt1745960', 'tt7131622', 'tt0993846', 'tt15671028', 'tt1431045', 'tt20234774', 'tt15398776', 'tt17009710', 'tt21064584', 'tt21192142', 'tt13238346', 'tt0120737', 'tt6710474', 'tt0325980', 'tt0330373', 'tt0088323', 'tt30319555', 'tt30852970', 'tt12888462', 'tt1645089', 'tt7775622']
const apikey = '6f79a8bf'

// an array to store movie objects
const movies = [];

// create movie html dynamically
function generateHtmlForMovie(movie) {
    return `
        <div class="col-lg-3 col-sm-6 mt-3">
            <div class="card h-100 movie-card">
                <img class="card-img-top img-fluid my-img" src="${movie.poster || 'images/placeholder4.jpg'}" alt="${movie.title}" />
                <div class="card-body-hidden">
                    <div class="card-body d-flex flex-column card-img-overlay">
                        <h4 class="card-title">${movie.title}</h4>
                        <p class="card-text text-truncate the-plot pt-3">Plot: ${movie.plot}</p>
                        <p class="card-text">Year: ${movie.year}</p>
                        <p class="card-text genre">Genre: ${movie.genre}</p>
                        <button class="btn custom-btn-primary open-modal mt-auto text-white">Open Movie</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// show movies
function displayMovies(movies) {
    $('#movieRow').empty();

    const rowWrapper = $('<div class="row"></div>');

    $.each(movies, function (index, movie) {
        const movieCard = $(generateHtmlForMovie(movie));
        rowWrapper.append(movieCard);
    });

    $('#movieRow').append(rowWrapper);
}

// send api call
function fetchMovieData(id) {
    return $.ajax({
        url: movieURL,
        method: 'GET',
        data: {
            i: id,
            plot: 'full',
            apikey: apikey
        }
    });
}

// get responses from api call to display movies
$.each(movieIds, function (index, id) {
    fetchMovieData(id)
        .done(function (response) {
            if (response.Response) {
                const movie = {
                    title: response.Title,
                    year: response.Year,
                    plot: response.Plot,
                    genre: response.Genre,
                    poster: response.Poster
                };
                movies.push(movie);
                if (movies.length === movieIds.length) {
                    displayMovies(movies);
                }
            } else {
                console.log('Error: Movie data not found.');
            }
        })
        .fail(function (xhr, status, errorThrown) {
            alert("Sorry, there was a problem!");
            console.log("Error: " + errorThrown);
            console.log("Status: " + status);
            console.dir(xhr);
        });
});

// function to show movie details modal
$('#movieRow').on('click', '.movie-card .open-modal', function () {

    const card = $(this).closest('.movie-card');
    const title = card.find('.card-title').text();
    const plot = card.find('.the-plot').text();
    const year = card.find('.card-text:nth-child(3)').text();
    const genre = card.find('.genre').text();
    const imgUrl = card.find('.my-img').attr('src');

    $('#modalTitle').text(title);
    $('#modalPlot').text(plot);
    $('#modalYear').text(year);
    $('#modalGenre').text(genre);
    $('#modalImg').attr('src', imgUrl);

    $('#movieModal').modal('show');
});

// filter and display movies by genre
$('#inputGroup').append($('#genreSearchBtn'));

function filterMoviesByGenre(genre) {
    const genreLowerCase = genre.toLowerCase();

    const filteredMovies = movies.filter(function (movie) {
        const movieGenre = movie.genre.toLowerCase();
        return movieGenre.includes(genreLowerCase);
    });

    return filteredMovies;
}

function renderFilteredMovies(filteredMovies) {
    if (filteredMovies.length === 0) {
        $('#movieRow').empty().append('<div><h5>No movies in that genre are found.</h5></div>');
    } else {
        displayMovies(filteredMovies);
    }
}

// button and keypress event to show filtered movies
$('#genreSearchBtn, #genreInput').on('click keypress', function (event) {
    if (event.type === 'click' || (event.type === 'keypress' && event.which === 13)) {
        if (event.type === 'keypress') {
            event.preventDefault();
        }
        const genreInput = $('#genreInput').val();
        const filteredMovies = filterMoviesByGenre(genreInput);
        renderFilteredMovies(filteredMovies);
    }
});

// event to show the add new movie form
$('#showAddMovieForm').click(function () {
    $('#addMovieModal').modal('show');
});

// create new movie if inputs are valid
$('#submitMovie').click(function () {
    const title = $('#movieTitle').val().trim();
    const releaseDate = $('#releaseDate').val().trim();
    const description = $('#movieDescription').val().trim();
    const genre = $('#movieGenre').val().trim();

    if (validateInputs(title, releaseDate, description, genre)) {
        const newMovie = {
            title: title,
            year: releaseDate,
            plot: description,
            genre: genre,
            poster: 'images/placeholder4.jpg'
        };

        movies.push(newMovie);

        const newMovieHtml = generateHtmlForMovie(newMovie);

        $('#movieRow').children().last().append(newMovieHtml);

        showToast('Movie added successfully.');

        $('#movieTitle').val('');
        $('#releaseDate').val('');
        $('#movieDescription').val('');
        $('#movieGenre').val('');

        $('#addMovieModal').modal('hide');
    }
});

// Function to show toast
function showToast(message) {
    $('.toast-body').text(message);
    $('.toast').toast('show');

    setTimeout(function () {
        $('.toast').toast('hide');
    }, 2000);

    setTimeout(function () {
        scrollToElement($('#movieRow'));
    }, 2000);
}

//Function to scroll to element
function scrollToElement(element) {
    $('html, body').animate({
        scrollTop: $(element).height()
    }, 'fast'
)}

// validate inputs and date
function isValidDateFormat(dateString) {
    const regex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    return regex.test(dateString);
}

function validateInputs(title, releaseDate, description, genre) {
    let isValid = true;

    if (title.trim().length === 0 || title.length > 250) {
        $('#movieTitleError').text('Please enter a valid movie title of 250 characters max.');
        isValid = false;
    }
    if (!isValidDateFormat(releaseDate)) {
        $('#releaseDateError').text('Please enter a valid release date in DD-MM-YYYY format.');
        isValid = false;
    }
    if (description.trim().length === 0 || description.length > 500) {
        $('#movieDescriptionError').text('Please enter a valid movie description of 500 characters max.');
        isValid = false;
    }
    if (!genre) {
        $('#movieGenreError').text('Please enter a genre.');
        isValid = false;
    }

    return isValid;
}

// Erase error message when user starts typing
$('#movieTitle, #releaseDate, #movieDescription, #movieGenre').on('input', function () {
    const inputId = $(this).attr('id');
    $(`#${inputId}Error`).text('');
});