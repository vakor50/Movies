

// parse the date / time
var parseTime = d3.timeParse("%d-%b-%y"),
    parseDateTime = d3.timeParse("%m-%d-%Y %H:%M:%S"),
    parseDateTime2 = d3.timeParse("%Y-%m-%d %H:%M:%S"),
    parseTime = d3.timeParse("%H:%M:%S"),
    parseDate = d3.timeParse("%m-%d-%Y"),
    parseYearMonth = d3.timeParse("%Y-%m")
    parseYearDayMonth = d3.timeParse("%Y-%d-%m")
    ;

var formatYearMonth = d3.timeFormat("%Y-%m"),
    formatMonthYear = d3.timeFormat("%b %Y")

var colorInterpolate = d3["interpolate" + "Viridis"] // Magma

d3.csv("tmdb_5000_movies.csv", function(error, movies) {
    if (error) throw error;
	d3.csv("tmdb_5000_credits.csv", function(error, credits) {
        if (error) throw error;



        var hash = Object.create(null);
        movies.concat(credits).forEach(function (obj) {
            hash[obj.title] = Object.assign(hash[obj.title] || {}, obj);
        })
        var films = Object.keys(hash).map(function (key) {
            return hash[key];
        })

        // cast = cast.filter((obj, pos, arr) => {
        //     // if this item has same position as first position in array e.g. is first
        //     return (arr.map(mapObj => mapObj["name"]).indexOf(obj["name"]) === pos) 
        // })
        var cast = []
        var crew = []
        var all_genre = []
        var all_keywords = {}

        films.forEach(function (obj) {
            // Cast
            obj.cast = JSON.parse(obj.cast)
            cast = cast.concat(obj.cast)
            // Crew
            obj.crew = JSON.parse(obj.crew)
            crew = crew.concat(obj.crew)
            // Genres
            genres = JSON.parse(obj.genres)
            filtered_genre = genres.map(e => e.name)
            all_genre = all_genre.concat(filtered_genre)
            obj.genres = filtered_genre
            // Keywords
            keywords = JSON.parse(obj.keywords)
            filtered_keywords = keywords.map(e => e.name)
            obj.keywords = filtered_keywords 
            filtered_keywords.forEach(function(w) {
                all_keywords[w] = 1 + (all_keywords[w] || 0);
            })
            // Production companies
            companies = JSON.parse(obj.production_companies)
            obj.production_companies = companies.map(e => e.name)
            // Production countries
            countries = JSON.parse(obj.production_countries)
            obj.production_countries = countries.map(e => e.name)
            // Spoken languages
            languages = JSON.parse(obj.spoken_languages)
            obj.spoken_languages = languages.map(e => e.name)
        })

        function binaryCategory (category_list, unique_list) {
            binaryList = []

            unique_list.forEach(function (g) {
                if (category_list.includes(g)) {
                    binaryList.push(1)
                } else {
                    binaryList.push(0)
                }
            })
            return binaryList
        }

        var unique_genres = all_genre.filter((v, i, a) => a.indexOf(v) === i); 
        films.map(x => x.genres_bin = binaryCategory(x.genres, unique_genres))
        


        console.log(films[0])

        function plotKeywords(tag) {
            var word_freq = []
            Object.keys(all_keywords).forEach(function (k) {
                if (all_keywords[k] > 20) {
                    word_freq.push({ "word": k, "count": all_keywords[k] })
                }
            })
            var margin = {top: 20, right: 20, bottom: 20, left: 100},
                width = $(tag).width() - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            // var canvas = d3.select(tag).append("canvas")
            //     .attr("width", width + margin.left + margin.right)
            //     .attr("height", height + margin.top + margin.bottom),
            //     canvas = document.querySelector(tag + " canvas"),
            //     context = canvas.getContext("2d"),
            //     width = canvas.width,
            //     height = canvas.height,
            //     tau = 2 * Math.PI;

            var nodes = word_freq.map(function(i) {
                return {
                    r: i.count / 3
                };
            });

            var svg = d3.select(tag).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)

            var node = svg.selectAll(".node")
                    .data(nodes)
                .enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function() { return "translate(" + margin.left + "," + margin.top + ")"; });

            // create the circle whose radius is based on the word frequency
            node.append("circle")
                .attr("r", function(d, i) { return d.r; })
                // .style("fill", function(d, i) { return color(i % 3); });


            // add text for each word centered on the same location as the bubble
            node.append("text")
                .attr("dy", ".3em")
                .style("text-anchor", "middle")
                .style("color", "white")
                .text(function(d, i) { 
                    return "test"; 
                });

            // var simulation = d3.forceSimulation(nodes)
            //     .velocityDecay(0.1)
            //     .force("x", d3.forceX().strength(0.005))
            //     .force("y", d3.forceY().strength(0.005))
            //     .force("collide", d3.forceCollide().radius(function(d) { return d.r + 0.5; }).iterations(2))
            //     .on("tick", ticked)
            //     .on("ontouchstart" in document ? "touchmove" : "mousemove", function(d) {
            //         console.log(d)
            //     });

            function ticked() {
                context.clearRect(0, 0, width, height);
                context.save();
                context.translate(width / 2, height / 2);  

                context.beginPath();
                nodes.forEach(function(d) {
                    context.moveTo(d.x + d.r, d.y);
                    context.arc(d.x, d.y, d.r, 0, tau);
                });
                context.fillStyle = "#ddd";
                context.fill();
                context.strokeStyle = "#333";
                context.stroke();  

                context.restore();
            }
        }

        function plotDirector(tag, pickJob) {
            crew = crew.filter(x => x.job == pickJob)

            // set the dimensions and margins of the graph
            var margin = {top: 20, right: 20, bottom: 20, left: 100},
                width = $(tag).width() - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            // append the svg object to the body of the page
            var svg = d3.select(tag).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", 
                        "translate(" + margin.left + "," + margin.top + ")");

            // set the ranges
            var x = d3.scaleLinear().range([0, width]);
            var y = d3.scaleBand()
                .range([height, 0])
                .padding(0.1);


            // configure data
            var o = {};
            var f = function(x){
                key = x.name
                if (o[key] === undefined) {
                    o[key] = {"name": key, "count": 0};
                };

                o[key].count = o[key].count + 1
            }

            crew.map(x => f(x)) //apply f to each member of data

            var most_crew = []
            Object.keys(o).forEach(function (k) {
                most_crew.push({ "name": k, "count": o[k].count })
            })
            most_crew.sort(function(a, b) { 
                if (a.count < b.count) { return 1; }
                else if (a.count == b.count) {return 0; }
                else { return -1; }
            });

            most_crew = most_crew.slice(0, 15)

            x.domain([0, d3.max(most_crew, function(d) { return d.count; })]);
            y.domain(most_crew.map(function(d) { return d.name; }));
            var color = d3.scaleSequential(colorInterpolate)
                .domain([d3.max(most_crew, function(d) { return d.count; }), 0]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x)) 

            svg.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(y));

            var bar = svg.selectAll(".bar")
                    .data(most_crew)
                .enter().append("g")
                    .attr("class", "bar");

            bar.append('rect')
                .style('fill', function(d) { return color(d.count); })
                .attr("x", 0)
                .attr("height",  y.bandwidth())
                .attr("y", function(d) { return y(d.name); })
                .attr("width", function(d) { return x(d.count); })

            bar.append("text")
                .attr("dy", ".4em")
                .attr("y", function(d) { return y(d.name) + y.bandwidth()/2})
                .attr("x", 15)
                .style('fill', 'white')
                .attr("text-anchor", "middle")
                .text(function(d) { return d.count; });
        }

        function plotCast(tag) {
            // set the dimensions and margins of the graph
            var margin = {top: 20, right: 20, bottom: 20, left: 100},
                width = $(tag).width() - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            // append the svg object to the body of the page
            var svg = d3.select(tag).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", 
                        "translate(" + margin.left + "," + margin.top + ")");

            // set the ranges
            var x = d3.scaleLinear().range([0, width]);
            var y = d3.scaleBand()
                .range([height, 0])
                .padding(0.1);


            // configure data
            var o = {};
            var f = function(x){
                key = x.name
                if (o[key] === undefined) {
                    o[key] = {"name": key, "count": 0};
                };

                o[key].count = o[key].count + 1
            }

            cast.map(x => f(x)) //apply f to each member of data

            var most_cast = []
            Object.keys(o).forEach(function (k) {
                most_cast.push({ "name": k, "count": o[k].count })
            })
            most_cast.sort(function(a, b) { 
                if (a.count < b.count) { return 1; }
                else if (a.count == b.count) {return 0; }
                else { return -1; }
            });

            most_cast = most_cast.slice(0, 15)

            x.domain([0, d3.max(most_cast, function(d) { return d.count; })]);
            y.domain(most_cast.map(function(d) { return d.name; }));
            var color = d3.scaleSequential(colorInterpolate)
                .domain([d3.max(most_cast, function(d) { return d.count; }), 0]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x)) 

            svg.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(y));

            var bar = svg.selectAll(".bar")
                    .data(most_cast)
                .enter().append("g")
                    .attr("class", "bar");

            bar.append('rect')
                .style('fill', function(d) { return color(d.count); })
                .attr("x", 0)
                .attr("height",  y.bandwidth())
                .attr("y", function(d) { return y(d.name); })
                .attr("width", function(d) { return x(d.count); })

            bar.append("text")
                .attr("dy", ".4em")
                .attr("y", function(d) { return y(d.name) + y.bandwidth()/2})
                .attr("x", 15)
                .style('fill', 'white')
                .attr("text-anchor", "middle")
                .text(function(d) { return d.count; });
        }

        function plotGenres(tag) {
            // set the dimensions and margins of the graph
            var margin = {top: 20, right: 20, bottom: 20, left: 80},
                width = $(tag).width() - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            // append the svg object to the body of the page
            var svg = d3.select(tag).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", 
                        "translate(" + margin.left + "," + margin.top + ")");

            // set the ranges
            var x = d3.scaleLinear().range([0, width]);
            var y = d3.scaleBand()
                .range([height, 0])
                .padding(0.1);


            // configure data
            var o = {};
            var f = function(key){
                if (o[key] === undefined) {
                    o[key] = {"genre": key, "count": 0};
                };

                o[key].count = o[key].count + 1
            }

            all_genre.map(x => f(x)) //apply f to each member of data

            var genres = []
            Object.keys(o).forEach(function (k) {
                genres.push({ "genre": o[k].genre, "count": o[k].count })
            })
            genres.sort(function(a, b) { return a.count - b.count; });

            x.domain([0, d3.max(genres, function(d) { return d.count; })]);
            y.domain(genres.map(function(d) { return d.genre; }));
            var color = d3.scaleSequential(colorInterpolate)
                .domain([d3.max(genres, function(d) { return d.count; }), 0]);

            

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x)) //.ticks(5).tickFormat(function(d) { return parseInt(d / 1000); }).tickSizeInner([-height]));

            svg.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(y));

            svg.selectAll(".bar")
                    .data(genres)
                .enter().append("rect")
                    .attr("class", "bar")
                    .style('fill', function(d) { return color(d.count); })
                    .attr("x", 0)
                    .attr("height",  y.bandwidth())
                    .attr("y", function(d) { return y(d.genre); })
                    .attr("width", function(d) { return x(d.count); })
                    .on("mouseover", function(d){
                        var tooltip = svg.append("text")
                            .attr("class", "toolTip")
                            .style("fill", "black")
                            .style("opacity", 1);;
                    })
                    .on("mousemove", function(d){
                        let mousePosition = d3.mouse(this);
                        let x = mousePosition[0] + 10//+ width/2;
                        let y = mousePosition[1] + 10//+ height/2 - 13;

                        let text = d3.select('.toolTip');
                        let bbox = text.node().getBBox();
                        if (x - bbox.width/2 < 0) {
                            x = bbox.width/2;
                        } else if (width - x - bbox.width/2 < 0) {
                            x = width - bbox.width/2;
                        } 

                        if (y - bbox.height/2 < 0) {
                            y = bbox.height + 13;
                        } else if (height - y - bbox.height/2 < 0) {
                            y = height - bbox.height/2;
                        } 
                        text
                          .attr('transform',`translate(${x}, ${y})`)
                          .style("display", "inline-block")
                          .html((d.genre) + ": " + (d.count));
                    })
                    .on("mouseout", function(d){ d3.select('.toolTip').remove();});
        }

        function plotMonthlyCounts(tag) {
            // set the dimensions and margins of the graph
            var margin = {top: 20, right: 20, bottom: 20, left: 20},
                width = $(tag).width() - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

            // append the svg object to the body of the page
            var svg = d3.select(tag).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", 
                        "translate(" + margin.left + "," + margin.top + ")");

            // set the ranges
            var x = d3.scaleTime()
                .range([0, width]);
            var y = d3.scaleLinear()
                .range([height, 0]);

            var xAxis = d3.axisBottom(x),
                yAxis = d3.axisLeft(y);

            var o = {};
            var f = function(x){
                date = parseYearDayMonth(x.release_date)
                var key = formatYearMonth( date );

                if (o[key] === undefined) {
                    o[key] = {"date": key, "count": 0};
                };

                o[key].count = o[key].count + 1
            }

            films.map(x => f(x)) //apply f to each member of data

            var months = []
            Object.keys(o).forEach(function (k) {
                months.push({ "date": o[k].date, "count": o[k].count })
            })

            x.domain(d3.extent(months, function(d) { return parseYearMonth(d.date); }));
            y.domain([0, d3.max(months, function(d) { return d.count; })]);
            var color = d3.scaleSequential(colorInterpolate)
                .domain([d3.max(months, function(d) { return parseYearMonth(d.date); }), 0]);

            var tooltipMargin = 13;

            // Add the bar chart
            svg.selectAll(".bar")
                .data(months)
              .enter().append("rect")
                .attr("class", "bar")
                .style('opacity', 0.8)
                .style('fill', function(d) { return color(parseYearMonth(d.date)); })
                .attr("x", function(d) { return x(parseYearMonth(d.date)); })
                .attr("y", function(d) { return y(d.count); })
                .attr("width", width/months.length)
                .attr("height", function(d) { return height - y(d.count); })

            // Add the X Axis
            var g = svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis
                    .tickFormat(d3.timeFormat("%b %Y")))

            // Add the Y Axis
            svg.append("g")
                .attr("class", "axis")
                .call(yAxis)
                .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Count");

        }


        // plotKeywords('#chart5')
        plotDirector('#chart4', "Director")
        plotCast('#chart3')
        plotGenres('#chart2')
        plotMonthlyCounts('#chart1')


        


        // convert the string array fields to arrays of the important field

        /*
        visualizations
            clickable web
                movie appears with cast
                click on cast member to open relevant movies

            genre films
                select genre from drop down
                options to sort by budget, popularity, revenue, runtime, vote_average
        */

    /*
        budget:                 "237000000"
        genres:                 "[  {"id": 28, "name": "Action"}, 
                                    {"id": 12, "name": "Adventure"}, 
                                    {"id": 14, "name": "Fantasy"}, 
                                    {"id": 878, "name": "Science Fiction"}  ]"
        homepage:               "http://www.avatarmovie.com/"
        id:                     "19995"
        keywords:               "[  {"id": 1463, "name": "culture clash"}, 
                                    {"id": 2964, "name": "future"}, 
                                    {"id": 3386, "name": "space war"}, 
                                    {"id": 3388, "name": "space colony"}, 
                                    {"id": 3679, "name": "society"}, 
                                    {"id": 3801, "name": "space travel"}, 
                                    {"id": 9685, "name": "futuristic"}, 
                                    {"id": 9840, "name": "romance"}, 
                                    {"id": 9882, "name": "space"}, 
                                    {"id": 9951, "name": "alien"}, 
                                    {"id": 10148, "name": "tribe"}, 
                                    {"id": 10158, "name": "alien planet"}, 
                                    {"id": 10987, "name": "cgi"}, 
                                    {"id": 11399, "name": "marine"}, 
                                    {"id": 13065, "name": "soldier"}, 
                                    {"id": 14643, "name": "battle"}, 
                                    {"id": 14720, "name": "love affair"}, 
                                    {"id": 165431, "name": "anti war"}, 
                                    {"id": 193554, "name": "power relations"}, 
                                    {"id": 206690, "name": "mind and soul"}, 
                                    {"id": 209714, "name": "3d"}  ]"
        original_language:      "en"
        original_title:         "Avatar"
        overview:               "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following orders and protecting an alien civilization."
        popularity:             "150.437577"
        production_companies:   "[  {"name": "Ingenious Film Partners", "id": 289}, 
                                    {"name": "Twentieth Century Fox Film Corporation", "id": 306}, 
                                    {"name": "Dune Entertainment", "id": 444}, 
                                    {"name": "Lightstorm Entertainment", "id": 574}  ]"
        production_countries:   "[  {"iso_3166_1": "US", "name": "United States of America"}, 
                                    {"iso_3166_1": "GB", "name": "United Kingdom"}  ]"
        release_date:           "2009-12-10"
        revenue:                "2787965087"
        runtime:                "162"
        spoken_languages:       "[  {"iso_639_1": "en", "name": "English"}, 
                                    {"iso_639_1": "es", "name": "Espa\u00f1ol"}]"
        status:                 "Released"
        tagline:                "Enter the World of Pandora."
        title:                  "Avatar"
        vote_average:           "7.2"
        vote_count:             "11800"
    */

    /*
        cast:       "[{"cast_id": 242, "character": "Jake Sully", "credit_id": "5602a8a7c3a3685532001c9a", "gender": 2, "id": 65731, "name": "Sam Worthington", "order": 0}, {"cast_id": 3, "character": "Neytiri", "credit_id": "52fe48009251416c750ac9cb", "gender": 1, "id": 8691, "name": "Zoe Saldana", "order": 1}, {"cast_id": 25, "character": "Dr. Grace Augustine", "credit_id": "52fe48009251416c750aca39", "gender": 1, "id": 10205, "name": "Sigourney Weaver", "order": 2}, {"cast_id": 4, "character": "Col. Quaritch", "credit_id": "52fe48009251416c750ac9cf", "gender": 2, "id": 32747, "name": "Stephen Lang", "order": 3}, {"cast_id": 5, "character": "Trudy Chacon", "credit_id": "52fe48009251416c750ac9d3", "gender": 1, "id": 17647, "name": "Michelle Rodriguez", "order": 4}, {"cast_id": 8, "character": "Selfridge", "credit_id": "52fe48009251416c750ac9e1", "gender": 2, "id": 1771, "name": "Giovanni Ribisi", "order": 5}, {"cast_id": 7, "character": "Norm Spellman", "credit_id": "52fe48009251416c750ac9dd", "gender": 2, "id": 59231, "name": "Joel David Moore", "order": 6}, {"cast_id": 9, "character": "Moat", "credit_id": "52fe48009251416c750ac9e5", "gender": 1, "id": 30485, "name": "CCH Pounder", "order": 7}, {"cast_id": 11, "character": "Eytukan", "credit_id": "52fe48009251416c750ac9ed", "gender": 2, "id": 15853, "name": "Wes Studi", "order": 8}, {"cast_id": 10, "character": "Tsu'Tey", "credit_id": "52fe48009251416c750ac9e9", "gender": 2, "id": 10964, "name": "Laz Alonso", "order": 9}, {"cast_id": 12, "character": "Dr. Max Patel", "credit_id": "52fe48009251416c750ac9f1", "gender": 2, "id": 95697, "name": "Dileep Rao", "order": 10}, {"cast_id": 13, "character": "Lyle Wainfleet", "credit_id": "52fe48009251416c750ac9f5", "gender": 2, "id": 98215, "name": "Matt Gerald", "order": 11}, {"cast_id": 32, "character": "Private Fike", "credit_id": "52fe48009251416c750aca5b", "gender": 2, "id": 154153, "name": "Sean Anthony Moran", "order": 12}, {"cast_id": 33, "character": "Cryo Vault Med Tech", "credit_id": "52fe48009251416c750aca5f", "gender": 2, "id": 397312, "name": "Jason Whyte", "order": 13}, {"cast_id": 34, "character": "Venture Star Crew Chief", "credit_id": "52fe48009251416c750aca63", "gender": 2, "id": 42317, "name": "Scott Lawrence", "order": 14}, {"cast_id": 35, "character": "Lock Up Trooper", "credit_id": "52fe48009251416c750aca67", "gender": 2, "id": 986734, "name": "Kelly Kilgour", "order": 15}, {"cast_id": 36, "character": "Shuttle Pilot", "credit_id": "52fe48009251416c750aca6b", "gender": 0, "id": 1207227, "name": "James Patrick Pitt", "order": 16}, {"cast_id": 37, "character": "Shuttle Co-Pilot", "credit_id": "52fe48009251416c750aca6f", "gender": 0, "id": 1180936, "name": "Sean Patrick Murphy", "order": 17}, {"cast_id": 38, "character": "Shuttle Crew Chief", "credit_id": "52fe48009251416c750aca73", "gender": 2, "id": 1019578, "name": "Peter Dillon", "order": 18}, {"cast_id": 39, "character": "Tractor Operator / Troupe", "credit_id": "52fe48009251416c750aca77", "gender": 0, "id": 91443, "name": "Kevin Dorman", "order": 19}, {"cast_id": 40, "character": "Dragon Gunship Pilot", "credit_id": "52fe48009251416c750aca7b", "gender": 2, "id": 173391, "name": "Kelson Henderson", "order": 20}, {"cast_id": 41, "character": "Dragon Gunship Gunner", "credit_id": "52fe48009251416c750aca7f", "gender": 0, "id": 1207236, "name": "David Van Horn", "order": 21}, {"cast_id": 42, "character": "Dragon Gunship Navigator", "credit_id": "52fe48009251416c750aca83", "gender": 0, "id": 215913, "name": "Jacob Tomuri", "order": 22}, {"cast_id": 43, "character": "Suit #1", "credit_id": "52fe48009251416c750aca87", "gender": 0, "id": 143206, "name": "Michael Blain-Rozgay", "order": 23}, {"cast_id": 44, "character": "Suit #2", "credit_id": "52fe48009251416c750aca8b", "gender": 2, "id": 169676, "name": "Jon Curry", "order": 24}, {"cast_id": 46, "character": "Ambient Room Tech", "credit_id": "52fe48009251416c750aca8f", "gender": 0, "id": 1048610, "name": "Luke Hawker", "order": 25}, {"cast_id": 47, "character": "Ambient Room Tech / Troupe", "credit_id": "52fe48009251416c750aca93", "gender": 0, "id": 42288, "name": "Woody Schultz", "order": 26}, {"cast_id": 48, "character": "Horse Clan Leader", "credit_id": "52fe48009251416c750aca97", "gender": 2, "id": 68278, "name": "Peter Mensah", "order": 27}, {"cast_id": 49, "character": "Link Room Tech", "credit_id": "52fe48009251416c750aca9b", "gender": 0, "id": 1207247, "name": "Sonia Yee", "order": 28}, {"cast_id": 50, "character": "Basketball Avatar / Troupe", "credit_id": "52fe48009251416c750aca9f", "gender": 1, "id": 1207248, "name": "Jahnel Curfman", "order": 29}, {"cast_id": 51, "character": "Basketball Avatar", "credit_id": "52fe48009251416c750acaa3", "gender": 0, "id": 89714, "name": "Ilram Choi", "order": 30}, {"cast_id": 52, "character": "Na'vi Child", "credit_id": "52fe48009251416c750acaa7", "gender": 0, "id": 1207249, "name": "Kyla Warren", "order": 31}, {"cast_id": 53, "character": "Troupe", "credit_id": "52fe480092… Leno Clark III", "order": 51}, {"cast_id": 73, "character": "Dancer", "credit_id": "52fe48019251416c750acafb", "gender": 0, "id": 1207268, "name": "Carvon Futrell", "order": 52}, {"cast_id": 74, "character": "Dancer", "credit_id": "52fe48019251416c750acaff", "gender": 0, "id": 1207269, "name": "Brandon Jelkes", "order": 53}, {"cast_id": 75, "character": "Dancer", "credit_id": "52fe48019251416c750acb03", "gender": 0, "id": 1207270, "name": "Micah Moch", "order": 54}, {"cast_id": 76, "character": "Dancer", "credit_id": "52fe48019251416c750acb07", "gender": 0, "id": 1207271, "name": "Hanniyah Muhammad", "order": 55}, {"cast_id": 77, "character": "Dancer", "credit_id": "52fe48019251416c750acb0b", "gender": 0, "id": 1207272, "name": "Christopher Nolen", "order": 56}, {"cast_id": 78, "character": "Dancer", "credit_id": "52fe48019251416c750acb0f", "gender": 0, "id": 1207273, "name": "Christa Oliver", "order": 57}, {"cast_id": 79, "character": "Dancer", "credit_id": "52fe48019251416c750acb13", "gender": 0, "id": 1207274, "name": "April Marie Thomas", "order": 58}, {"cast_id": 80, "character": "Dancer", "credit_id": "52fe48019251416c750acb17", "gender": 0, "id": 1207275, "name": "Bravita A. Threatt", "order": 59}, {"cast_id": 81, "character": "Mining Chief (uncredited)", "credit_id": "52fe48019251416c750acb1b", "gender": 0, "id": 1207276, "name": "Colin Bleasdale", "order": 60}, {"cast_id": 82, "character": "Veteran Miner (uncredited)", "credit_id": "52fe48019251416c750acb1f", "gender": 0, "id": 107969, "name": "Mike Bodnar", "order": 61}, {"cast_id": 83, "character": "Richard (uncredited)", "credit_id": "52fe48019251416c750acb23", "gender": 0, "id": 1207278, "name": "Matt Clayton", "order": 62}, {"cast_id": 84, "character": "Nav'i (uncredited)", "credit_id": "52fe48019251416c750acb27", "gender": 1, "id": 147898, "name": "Nicole Dionne", "order": 63}, {"cast_id": 85, "character": "Trooper (uncredited)", "credit_id": "52fe48019251416c750acb2b", "gender": 0, "id": 1207280, "name": "Jamie Harrison", "order": 64}, {"cast_id": 86, "character": "Trooper (uncredited)", "credit_id": "52fe48019251416c750acb2f", "gender": 0, "id": 1207281, "name": "Allan Henry", "order": 65}, {"cast_id": 87, "character": "Ground Technician (uncredited)", "credit_id": "52fe48019251416c750acb33", "gender": 2, "id": 1207282, "name": "Anthony Ingruber", "order": 66}, {"cast_id": 88, "character": "Flight Crew Mechanic (uncredited)", "credit_id": "52fe48019251416c750acb37", "gender": 0, "id": 1207283, "name": "Ashley Jeffery", "order": 67}, {"cast_id": 14, "character": "Samson Pilot", "credit_id": "52fe48009251416c750ac9f9", "gender": 0, "id": 98216, "name": "Dean Knowsley", "order": 68}, {"cast_id": 89, "character": "Trooper (uncredited)", "credit_id": "52fe48019251416c750acb3b", "gender": 0, "id": 1201399, "name": "Joseph Mika-Hunt", "order": 69}, {"cast_id": 90, "character": "Banshee (uncredited)", "credit_id": "52fe48019251416c750acb3f", "gender": 0, "id": 236696, "name": "Terry Notary", "order": 70}, {"cast_id": 91, "character": "Soldier (uncredited)", "credit_id": "52fe48019251416c750acb43", "gender": 0, "id": 1207287, "name": "Kai Pantano", "order": 71}, {"cast_id": 92, "character": "Blast Technician (uncredited)", "credit_id": "52fe48019251416c750acb47", "gender": 0, "id": 1207288, "name": "Logan Pithyou", "order": 72}, {"cast_id": 93, "character": "Vindum Raah (uncredited)", "credit_id": "52fe48019251416c750acb4b", "gender": 0, "id": 1207289, "name": "Stuart Pollock", "order": 73}, {"cast_id": 94, "character": "Hero (uncredited)", "credit_id": "52fe48019251416c750acb4f", "gender": 0, "id": 584868, "name": "Raja", "order": 74}, {"cast_id": 95, "character": "Ops Centreworker (uncredited)", "credit_id": "52fe48019251416c750acb53", "gender": 0, "id": 1207290, "name": "Gareth Ruck", "order": 75}, {"cast_id": 96, "character": "Engineer (uncredited)", "credit_id": "52fe48019251416c750acb57", "gender": 0, "id": 1062463, "name": "Rhian Sheehan", "order": 76}, {"cast_id": 97, "character": "Col. Quaritch's Mech Suit (uncredited)", "credit_id": "52fe48019251416c750acb5b", "gender": 0, "id": 60656, "name": "T. J. Storm", "order": 77}, {"cast_id": 98, "character": "Female Marine (uncredited)", "credit_id": "52fe48019251416c750acb5f", "gender": 0, "id": 1207291, "name": "Jodie Taylor", "order": 78}, {"cast_id": 99, "character": "Ikran Clan Leader (uncredited)", "credit_id": "52fe48019251416c750acb63", "gender": 1, "id": 1186027, "name": "Alicia Vela-Bailey", "order": 79}, {"cast_id": 100, "character": "Geologist (uncredited)", "credit_id": "52fe48019251416c750acb67", "gender": 0, "id": 1207292, "name": "Richard Whiteside", "order": 80}, {"cast_id": 101, "character": "Na'vi (uncredited)", "credit_id": "52fe48019251416c750acb6b", "gender": 0, "id": 103259, "name": "Nikie Zambo", "order": 81}, {"cast_id": 102, "character": "Ambient Room Tech / Troupe", "credit_id": "52fe48019251416c750acb6f", "gender": 1, "id": 42286, "name": "Julene Renee", "order": 82}]"
        crew:       "[{"credit_id": "52fe48009251416c750aca23", "department": "Editing", "gender": 0, "id": 1721, "job": "Editor", "name": "Stephen E. Rivkin"}, {"credit_id": "539c47ecc3a36810e3001f87", "department": "Art", "gender": 2, "id": 496, "job": "Production Design", "name": "Rick Carter"}, {"credit_id": "54491c89c3a3680fb4001cf7", "department": "Sound", "gender": 0, "id": 900, "job": "Sound Designer", "name": "Christopher Boyes"}, {"credit_id": "54491cb70e0a267480001bd0", "department": "Sound", "gender": 0, "id": 900, "job": "Supervising Sound Editor", "name": "Christopher Boyes"}, {"credit_id": "539c4a4cc3a36810c9002101", "department": "Production", "gender": 1, "id": 1262, "job": "Casting", "name": "Mali Finn"}, {"credit_id": "5544ee3b925141499f0008fc", "department": "Sound", "gender": 2, "id": 1729, "job": "Original Music Composer", "name": "James Horner"}, {"credit_id": "52fe48009251416c750ac9c3", "department": "Directing", "gender": 2, "id": 2710, "job": "Director", "name": "James Cameron"}, {"credit_id": "52fe48009251416c750ac9d9", "department": "Writing", "gender": 2, "id": 2710, "job": "Writer", "name": "James Cameron"}, {"credit_id": "52fe48009251416c750aca17", "department": "Editing", "gender": 2, "id": 2710, "job": "Editor", "name": "James Cameron"}, {"credit_id": "52fe48009251416c750aca29", "department": "Production", "gender": 2, "id": 2710, "job": "Producer", "name": "James Cameron"}, {"credit_id": "52fe48009251416c750aca3f", "department": "Writing", "gender": 2, "id": 2710, "job": "Screenplay", "name": "James Cameron"}, {"credit_id": "539c4987c3a36810ba0021a4", "department": "Art", "gender": 2, "id": 7236, "job": "Art Direction", "name": "Andrew Menzies"}, {"credit_id": "549598c3c3a3686ae9004383", "department": "Visual Effects", "gender": 0, "id": 6690, "job": "Visual Effects Producer", "name": "Jill Brooks"}, {"credit_id": "52fe48009251416c750aca4b", "department": "Production", "gender": 1, "id": 6347, "job": "Casting", "name": "Margery Simkin"}, {"credit_id": "570b6f419251417da70032fe", "department": "Art", "gender": 2, "id": 6878, "job": "Supervising Art Director", "name": "Kevin Ishioka"}, {"credit_id": "5495a0fac3a3686ae9004468", "department": "Sound", "gender": 0, "id": 6883, "job": "Music Editor", "name": "Dick Bernstein"}, {"credit_id": "54959706c3a3686af3003e81", "department": "Sound", "gender": 0, "id": 8159, "job": "Sound Effects Editor", "name": "Shannon Mills"}, {"credit_id": "54491d58c3a3680fb1001ccb", "department": "Sound", "gender": 0, "id": 8160, "job": "Foley", "name": "Dennie Thorpe"}, {"credit_id": "54491d6cc3a3680fa5001b2c", "department": "Sound", "gender": 0, "id": 8163, "job": "Foley", "name": "Jana Vance"}, {"credit_id": "52fe48009251416c750aca57", "department": "Costume & Make-Up", "gender": 1, "id": 8527, "job": "Costume Design", "name": "Deborah Lynn Scott"}, {"credit_id": "52fe48009251416c750aca2f", "department": "Production", "gender": 2, "id": 8529, "job": "Producer", "name": "Jon Landau"}, {"credit_id": "539c4937c3a36810ba002194", "department": "Art", "gender": 0, "id": 9618, "job": "Art Direction", "name": "Sean Haworth"}, {"credit_id": "539c49b6c3a36810c10020e6", "department": "Art", "gender": 1, "id": 12653, "job": "Set Decoration", "name": "Kim Sinclair"}, {"credit_id": "570b6f2f9251413a0e00020d", "department": "Art", "gender": 1, "id": 12653, "job": "Supervising Art Director", "name": "Kim Sinclair"}, {"credit_id": "54491a6c0e0a26748c001b19", "department": "Art", "gender": 2, "id": 14350, "job": "Set Designer", "name": "Richard F. Mays"}, {"credit_id": "56928cf4c3a3684cff0025c4", "department": "Production", "gender": 1, "id": 20294, "job": "Executive Producer", "name": "Laeta Kalogridis"}, {"credit_id": "52fe48009251416c750aca51", "department": "Costume & Make-Up", "gender": 0, "id": 17675, "job": "Costume Design", "name": "Mayes C. Rubeo"}, {"credit_id": "52fe48009251416c750aca11", "department": "Camera", "gender": 2, "id": 18265, "job": "Director of Photography", "name": "Mauro Fiore"}, {"credit_id": "5449194d0e0a26748f001b39", "department": "Art", "gender": 0, "id": 42281, "job": "Set Designer", "name": "Scott Herbertson"}, {"credit_id": "52fe48009251416c750aca05", "department": "Crew", "gender": 0, "id": 42288, "job": "Stunts", "name": "Woody Schultz"}, {"credit_id": "5592aefb92514152de0010f5", "department": "Costume & Make-Up", "gender": 0, "id": 29067, "job": "Makeup Artist", "name": "Linda DeVetta"}, {"credit_id": "5592afa492514152de00112c", "department": "Costume & Make-Up", "gender": 0, "id": 29067, "job": "Hairstylist", "name": "Linda DeVetta"}, {"credit_id": "54959ed592514130fc002e5d", "department": "Camera", "gender": 2, "id": 33302, "job": "Camera Operator", "name": "Richard Bluck"}, {"credit_id": "539c4891c3a36810ba002147", "department": "Art", "gender": 2, "id": 33303, "job": "Art Direction", "name": "Simon Bright"}, {"credit_id": "54959c069251417a81001f3a", "department": "Visual Effects", "gender": 0, "id": 113145, "job": "Visual Effects Supervisor", "n…": "54959f47c3a3681153002774", "department": "Lighting", "gender": 0, "id": 1401807, "job": "Lighting Technician", "name": "Scott Sprague"}, {"credit_id": "54959f8cc3a36831b8001df2", "department": "Visual Effects", "gender": 0, "id": 1401808, "job": "Animation Director", "name": "Jeremy Hollobon"}, {"credit_id": "54959fa0c3a36831b8001dfb", "department": "Visual Effects", "gender": 0, "id": 1401809, "job": "Animation Director", "name": "Orlando Meunier"}, {"credit_id": "54959fb6c3a3686af3003f54", "department": "Visual Effects", "gender": 0, "id": 1401810, "job": "Animation Director", "name": "Taisuke Tanimura"}, {"credit_id": "54959fd2c3a36831b8001e02", "department": "Costume & Make-Up", "gender": 0, "id": 1401812, "job": "Set Costumer", "name": "Lilia Mishel Acevedo"}, {"credit_id": "54959ff9c3a3686ae300440c", "department": "Costume & Make-Up", "gender": 0, "id": 1401814, "job": "Set Costumer", "name": "Alejandro M. Hernandez"}, {"credit_id": "5495a0ddc3a3686ae10046fe", "department": "Editing", "gender": 0, "id": 1401815, "job": "Digital Intermediate", "name": "Marvin Hall"}, {"credit_id": "5495a1f7c3a3686ae3004443", "department": "Production", "gender": 0, "id": 1401816, "job": "Publicist", "name": "Judy Alley"}, {"credit_id": "5592b29fc3a36869d100002f", "department": "Crew", "gender": 0, "id": 1418381, "job": "CG Supervisor", "name": "Mike Perry"}, {"credit_id": "5592b23a9251415df8001081", "department": "Crew", "gender": 0, "id": 1426854, "job": "CG Supervisor", "name": "Andrew Morley"}, {"credit_id": "55491e1192514104c40002d8", "department": "Art", "gender": 0, "id": 1438901, "job": "Conceptual Design", "name": "Seth Engstrom"}, {"credit_id": "5525d5809251417276002b06", "department": "Crew", "gender": 0, "id": 1447362, "job": "Visual Effects Art Director", "name": "Eric Oliver"}, {"credit_id": "554427ca925141586500312a", "department": "Visual Effects", "gender": 0, "id": 1447503, "job": "Modeling", "name": "Matsune Suzuki"}, {"credit_id": "551906889251415aab001c88", "department": "Art", "gender": 0, "id": 1447524, "job": "Art Department Manager", "name": "Paul Tobin"}, {"credit_id": "5592af8492514152cc0010de", "department": "Costume & Make-Up", "gender": 0, "id": 1452643, "job": "Hairstylist", "name": "Roxane Griffin"}, {"credit_id": "553d3c109251415852001318", "department": "Lighting", "gender": 0, "id": 1453938, "job": "Lighting Artist", "name": "Arun Ram-Mohan"}, {"credit_id": "5592af4692514152d5001355", "department": "Costume & Make-Up", "gender": 0, "id": 1457305, "job": "Makeup Artist", "name": "Georgia Lockhart-Adams"}, {"credit_id": "5592b2eac3a36877470012a5", "department": "Crew", "gender": 0, "id": 1466035, "job": "CG Supervisor", "name": "Thrain Shadbolt"}, {"credit_id": "5592b032c3a36877450015f1", "department": "Crew", "gender": 0, "id": 1483220, "job": "CG Supervisor", "name": "Brad Alexander"}, {"credit_id": "5592b05592514152d80012f6", "department": "Crew", "gender": 0, "id": 1483221, "job": "CG Supervisor", "name": "Shadi Almassizadeh"}, {"credit_id": "5592b090c3a36877570010b5", "department": "Crew", "gender": 0, "id": 1483222, "job": "CG Supervisor", "name": "Simon Clutterbuck"}, {"credit_id": "5592b0dbc3a368774b00112c", "department": "Crew", "gender": 0, "id": 1483223, "job": "CG Supervisor", "name": "Graeme Demmocks"}, {"credit_id": "5592b0fe92514152db0010c1", "department": "Crew", "gender": 0, "id": 1483224, "job": "CG Supervisor", "name": "Adrian Fernandes"}, {"credit_id": "5592b11f9251415df8001059", "department": "Crew", "gender": 0, "id": 1483225, "job": "CG Supervisor", "name": "Mitch Gates"}, {"credit_id": "5592b15dc3a3687745001645", "department": "Crew", "gender": 0, "id": 1483226, "job": "CG Supervisor", "name": "Jerry Kung"}, {"credit_id": "5592b18e925141645a0004ae", "department": "Crew", "gender": 0, "id": 1483227, "job": "CG Supervisor", "name": "Andy Lomas"}, {"credit_id": "5592b1bfc3a368775d0010e7", "department": "Crew", "gender": 0, "id": 1483228, "job": "CG Supervisor", "name": "Sebastian Marino"}, {"credit_id": "5592b2049251415df8001078", "department": "Crew", "gender": 0, "id": 1483229, "job": "CG Supervisor", "name": "Matthias Menz"}, {"credit_id": "5592b27b92514152d800136a", "department": "Crew", "gender": 0, "id": 1483230, "job": "CG Supervisor", "name": "Sergei Nevshupov"}, {"credit_id": "5592b2c3c3a36869e800003c", "department": "Crew", "gender": 0, "id": 1483231, "job": "CG Supervisor", "name": "Philippe Rebours"}, {"credit_id": "5592b317c3a36877470012af", "department": "Crew", "gender": 0, "id": 1483232, "job": "CG Supervisor", "name": "Michael Takarangi"}, {"credit_id": "5592b345c3a36877470012bb", "department": "Crew", "gender": 0, "id": 1483233, "job": "CG Supervisor", "name": "David Weitzberg"}, {"credit_id": "5592b37cc3a368775100113b", "department": "Crew", "gender": 0, "id": 1483234, "job": "CG Supervisor", "name": "Ben White"}, {"credit_id": "573c8e2f9251413f5d000094", "department": "Crew", "gender": 1, "id": 1621932, "job": "Stunts", "name": "Min Windle"}]"
        movie_id:   "19995"
        title:      "Avatar"
    */
    })
})
