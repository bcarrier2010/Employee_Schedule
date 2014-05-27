// COLORS_RGB holds one color for each name
// Colors are assigned to names in the order each name is first processed
var COLORS_RGB = ['rgb(231, 63, 63)','rgb(0, 155, 155)','rgb(247, 108, 39)','rgb(231, 231, 75)'];
var COLORS = COLORS_RGB.map(rgb2hex);

var DAY;
var TIME;
var schedule = new XMLHttpRequest();
var NAMES = new Array();


//http://www.sitepoint.com/javascript-generate-lighter-darker-color/
function ColorLuminance(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;
    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i*2,2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00"+c).substr(c.length);
    }
    return rgb;
}

function hex2r(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hex2g(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hex2b(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

//Unused, kept for symmetry
function hex2rgb(hex){
    hex = cutHex(hex);
    return 'rgb(' + hex2r(hex) + ', ' + hex2g(hex) + ', ' + hex2b(hex) + ')';
}

//Function to convert hex format to a rgb color
function hex(x) {
    var hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");
    return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}



var TimeToString = new Array();
TimeToString[10] = 'ten';
TimeToString[11] = 'eleven';
TimeToString[12] = 'twelve';
TimeToString[13] = 'thirteen';
TimeToString[14] = 'fourteen';
TimeToString[15] = 'fifteen';
TimeToString[16] = 'sixteen';

function getTimeName(n){
    if(typeof n == 'string'){
        n = parseInt(n.substring(0,2));
    }
    if(n){
        return TimeToString[n];
    }
    else{
        return '';
    }
}

var DayToName = new Array();
DayToName[1] = 'Monday';
DayToName[2] = 'Tuesday';
DayToName[3] = 'Wednesday';
DayToName[4] = 'Thursday';
DayToName[5] = 'Friday';

function getDayName(m) {
    if(typeof m == 'string'){
        m = parseInt(m);
    }
    if(m){
        return DayToName[m];
    }
    else{
        return '';
    }
}

function getDayNum(m) {
    if(typeof m == 'number'){
        m = m.toString();
    }
    for (var i = 0; i < DayToName.length; i++) {
        if(getDayName(i) == m){
            return i;
        }
    }
    return 0;
}

function getSchedule(){
    schedule.open("get", "schedule.csv", false);
    schedule.send();
}

function makeTable() {
    var tr;
    var td;
    var dividertd;
    var i, j;
    var emptyBool = 1;
    var notEmpty = [];
    var nc = 0;
    var keep = []
    var e = 0;
    var table = document.getElementById('table');
    var curr;

    var tag = 'null'
    var stag = '<' + tag + '>'
    var etag = '<' + tag + '/>'


    // Split schedule csv on rows to 1-D array
    var csv = schedule.responseText.split('\n');

    // Split csv array on columns to 2-D array
    for(var f = 0; f<csv.length; f++){
        csv[f] = csv[f].split(',');
    }

    // Gets size for each day and fills in missing day names if necessary
    var days = [0,0,0,0,0,0];
    var lastDay = '';
    for(var c = 0; c < csv[0].length; c++){
        if(csv[0][c]){
            lastDay = csv[0][c];
        }
        else{
            csv[0][c] = lastDay;
        }
        days[getDayNum(lastDay)]++;
    }
    
    var divider = 0;
    var dayCount = 1;

    for(var i = 0; i < csv.length; i++)
    {
        
        tr = document.createElement('tr');
        tr.setAttribute('class', getTimeName(parseInt(csv[i][0].substring(0,2))));
        for(var j = 0; j < csv[0].length; j++)
        {
            td = document.createElement('td');
        
            if(getTimeName(csv[i][j]) != ''){
                td.setAttribute('class', 'time');
                td.innerHTML = csv[i][j].substring(0,2);
            }
            else if(getDayNum(csv[i][j]) != 0){
                td.innerHTML = stag + csv[i][j] + etag;
                td.setAttribute('class', 'day');
                td.setAttribute('colSpan', days[getDayNum(csv[i][j])]);
                j+=days[getDayNum(csv[i][j])]-1;
            }
            else if(csv[i][j] != ''){
                if(NAMES.indexOf(csv[i][j])<0){
                    NAMES[NAMES.length] = csv[i][j];
                }
                td.setAttribute('class', csv[0][j] + ' ' + getTimeName(csv[i][0]) + ' ' + csv[i][j]);
            }
            else{
                td.setAttribute('class', csv[0][j] + ' ' + getTimeName(csv[i][0]));
            }

            tr.appendChild(td);

            if(j < csv[0].length-1 & j==divider){
                dividertd = document.createElement('td');
                dividertd.setAttribute('class', 'divider');
                tr.appendChild(dividertd);
                divider+=days[dayCount];
                dayCount++;
            } 
                       
        }
        table.appendChild(tr);

        if((i==0)|(i==csv.length-1)){
           var linetr = document.createElement('tr');
           linetr.setAttribute('class', 'line');
           var linetd = document.createElement('td');
           linetd.setAttribute('colSpan', csv[0].length+5);
           linetr.appendChild(linetd);
           table.appendChild(linetr);
        }

        divider = 0;
        dayCount = 1;
    }

}


function makeKey() {
    var tr;
    var td;
    var div;
    var dividertd;
    var table = document.getElementById('key');

    var tag = 'null'
    var stag = '<' + tag + '>'
    var etag = '<' + tag + '/>'

    tr = document.createElement('tr');
    tr.setAttribute('class', '');

    for(var i = 0; i < NAMES.length; i++)
    {        
        td = document.createElement('td');    
        div = document.createElement('div');
        td.setAttribute('class', 'name ' + NAMES[i]);
        div.innerHTML = '<p>' + NAMES[i] + '</p>';
        td.appendChild(div);
        tr.appendChild(td);

        if(i != NAMES.length - 1){
            dividertd = document.createElement('td');
            dividertd.setAttribute('class', 'divider');
            tr.appendChild(dividertd);
        }
    }
         
                       
        
    table.appendChild(tr);


    divider = 0;
    dayCount = 1;


}

// Darkens cell background color based on class names passed as arguments, i.e. day, time
function darken(day, time) {
    var nameList = []
    var classes = '';
    for (var i = 0; i < arguments.length; i++) {
        classes += '.' + arguments[i];
    }

    var element = document.querySelectorAll('.table ' + classes);    

    /* Will only darken color if it is in color set COLORS_RGB */
    /* i.e. Will only darken a cell once */
    for (var i = 0; i < element.length; i++) {
        var n = element[i].className.split(' ')[2];
        if(n){
            nameList[nameList.length] = n;
        }
        var style = window.getComputedStyle(element[i]);
        var bcolor = style.getPropertyValue('background-color');
        if(COLORS_RGB.indexOf(bcolor)>=0)
        {
            element[i].style['backgroundColor'] = ColorLuminance(rgb2hex(bcolor), -.25);
        }
    };
    

    /* Darkens those working in Key */
    for (var i = 0; i < nameList.length; i++) {
        classes = '.name.' + nameList[i];
        element = document.querySelectorAll(classes);
        var style = window.getComputedStyle(element[0]);
        var bcolor = style.getPropertyValue('background-color');
        if(COLORS_RGB.indexOf(bcolor)>=0)
        {
            element[0].style['backgroundColor'] = ColorLuminance(rgb2hex(bcolor), -.25);
        }
    };
    
}

//Sets default cell colors
function setColors() {
    var classes = '';
    var elements;

    for (var i = 0; i < NAMES.length; i++) {
        classes = '.' + NAMES[i];
        elements = document.querySelectorAll('.table ' + classes);
        for (var j = 0; j < elements.length; j++) {
            elements[j].style['backgroundColor'] = COLORS_RGB[i];
        }
    }

    for (var i = 0; i < NAMES.length; i++) {
        classes = '.' + NAMES[i];
        elements = document.querySelectorAll('.key ' + classes);
        for (var j = 0; j < elements.length; j++) {
            elements[j].style['backgroundColor'] = COLORS_RGB[i];
        }
    }
}

//Calls darken for current date and time
function setByTime() {
    var i;
    var d = new Date();
    var time = getTimeName(d.getHours());
    var day = getDayName(d.getDay());

    if((day!=DAY)|(time!=TIME))
    {
        DAY = day;
        TIME = time;
        darken(day, time);
    }
}

//Calls creation functions and sets interval
function startTimer(){
    getSchedule();
    makeTable();
    makeKey(); 
    setColors();
    setByTime();
    var intervalID = window.setInterval(setByTime, 1000);
}
