//default is state13 for GA, change that number to get data for other states
//the number after naics is the number of digits in the naics code
var promises = [
    d3.csv("data/industry_ID_list.csv"),
    d3.tsv("data/usa/GA/industries_state13_naics2.tsv"),
    //d3.tsv("data/c3.tsv"),
    d3.tsv("data/usa/GA/industries_state13_naics4.tsv"),
    //d3.tsv("data/c5.tsv"),
    d3.tsv("data/usa/GA/industries_state13_naics6.tsv"),
    d3.csv("data/county_ID_list.csv"),
    d3.tsv("data/usa/GA/industries_state13_naics2_state.tsv"),
    d3.tsv("data/usa/GA/industries_state13_naics4_state.tsv"),
    d3.tsv("data/usa/GA/industries_state13_naics6_state.tsv"),
    d3.tsv("data/usa/GA/industries_state13_naics2_state_api.tsv"),
    d3.tsv("data/usa/GA/industries_state13_naics4_state_api.tsv"),
    d3.tsv("data/usa/GA/industries_state13_naics6_state_api.tsv"),

]


Promise.all(promises).then(ready);


function ready(values) {
    dataObject={}
    industryData = {
        'ActualRate': formatIndustryData(values[d3.select("#naics").node().value/2]),
    }
    dataObject.industryData=industryData;

    
    if (d3.select("#naics").node().value==2){
        industryDataState = {
            'ActualRate': formatIndustryData(values[5])
        }
    }else if(d3.select("#naics").node().value==4){
        industryDataState = {
            'ActualRate': formatIndustryData(values[6])
        }
    }else if(d3.select("#naics").node().value==6){
        industryDataState = {
            'ActualRate': formatIndustryData(values[7])
        }
    }
        
    dataObject.industryDataState=industryDataState;


    if (d3.select("#naics").node().value==2){
        industryDataStateApi = {
            'ActualRate': formatIndustryData(values[8])
        }
    }else if(d3.select("#naics").node().value==4){
        industryDataStateApi = {
            'ActualRate': formatIndustryData(values[9])
        }
    }else if(d3.select("#naics").node().value==6){
        industryDataStateApi = {
            'ActualRate': formatIndustryData(values[10])
        }
    }
        
    dataObject.industryDataStateApi=industryDataStateApi;

    industryNames = {}
    values[0].forEach(function(item){
        industryNames[+item.relevant_naics] = item.industry_detail
    })
    dataObject.industryNames=industryNames;
    counties = []
    values[4].forEach(function(item){
        if(item.abvr =="GA"){
            counties.push(item.id)
        }
    })
    dataObject.counties=counties;
    statelength=dataObject.counties.length
    if(param["geo"]){
        geo=param["geo"]
        if (geo.includes(",")){
            geos=geo.split(",")
            fips=[]
            for (var i = 0; i<geos.length; i++){
                fips.push(geos[i].split("US")[1])
            }
        }else{
            fips = geo.split("US")[1]
        }
    }else{
        fips = "state";
    }

    topRatesInFips(dataObject, dataObject.industryNames, fips, 20, d3.select("#catsort"))

    //code for what happens when you choose the state and county from drop down
    d3.selectAll(".picklist").on("change",function(){
        dataObject.industryData= {
            'ActualRate': formatIndustryData(values[d3.select("#naics").node().value/2]),
        }

        if (d3.select("#naics").node().value==2){
            industryDataState = {
                'ActualRate': formatIndustryData(values[5])
            }
        }else if(d3.select("#naics").node().value==4){
            industryDataState = {
                'ActualRate': formatIndustryData(values[6])
            }
        }else if(d3.select("#naics").node().value==6){
            industryDataState = {
                'ActualRate': formatIndustryData(values[7])
            }
        }
            
        dataObject.industryDataState=industryDataState;

        if (d3.select("#naics").node().value==2){
            industryDataStateApi = {
                'ActualRate': formatIndustryData(values[8])
            }
        }else if(d3.select("#naics").node().value==4){
            industryDataStateApi = {
                'ActualRate': formatIndustryData(values[9])
            }
        }else if(d3.select("#naics").node().value==6){
            industryDataStateApi = {
                'ActualRate': formatIndustryData(values[10])
            }
        }
            
        dataObject.industryDataStateApi=industryDataStateApi;

            if (param["geo"]){
                geo=param["geo"]
                if (geo.includes(",")){
                    geos=geo.split(",")
                    fips=[]
                    for (var i = 0; i<geos.length; i++){
                        fips.push(geos[i].split("US")[1])
                    }
                }else{
                    fips = geo.split("US")[1]
                }
            }else{
                fips = "state";
            }

        topRatesInFips(dataObject, dataObject.industryNames, fips, 20, d3.select("#catsort"))
        
    });

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Functions


//function for when the geo hash changes
function geoChanged(param){
    if(param.geo){
        geo=param.geo
        if (geo.includes(",")){
            geos=geo.split(",")
            fips=[]
            for (var i = 0; i<geos.length; i++){
                fips.push(geos[i].split("US")[1])
            }
        }else{
            fips = geo.split("US")[1]
        }

    }else{
        fips = "state";
    }
    topRatesInFips(dataObject, dataObject.industryNames, fips, 20, d3.select("#catsort"))
}


function parseSubsetValues(entry, subsetKeys, randOffset) {
    subsets = {}
    subsetKeys.forEach(d=>{
        if (randOffset==true) {
            subsets[d] = entry[d] + getRndPercentError() * +entry[d]
        } else {
            subsets[d] = entry[d]
        }
    })
    return subsets
}


function formatIndustryData(rawData) {
    // var industryByType = d3.map()
    var industryByType = {}

    subsetKeys = ['emp', 'payann', 'estab', 'NAICS2012_TTL','GEO_TTL','state','COUNTY','relevant_naics']

    for (var i = 1; i<rawData.length; i++){

        entry = rawData[i]
        industryID = entry.relevant_naics

        if (industryID in industryByType) {
            industryByType[entry.relevant_naics][entry.id] = parseSubsetValues(entry, subsetKeys)
        } else {
            industryByType[entry.relevant_naics] = {}
            industryByType[entry.relevant_naics][entry.id] = parseSubsetValues(entry, subsetKeys)
        }
    }
    return industryByType
}


function keyFound(this_key, cat_filter) {
    if (this_key <= 1) {
        return false;
    } else if (cat_filter.length == 0) { // No filter
        return true;
    } else if (cat_filter.includes(this_key.slice(0,4))) { // Starts with key
        return true;
    } else {
        return false;
    }
}

//the code to give you the top n rows of data for a specific fips
function topRatesInFips(dataSet, dataNames, fips, howMany, whichVal){

    // NAICS FROM community/projects/biotech
    var bio_input = "113000,321113,113310,32121,32191,562213,541620,";
    var bio_output = "325211,325991,3256,335991,325120,326190,";
    var green_energy = "221117,221111,221113,221114,221115,221116,221118";
    var cat_filter = [];
    //if (param['go'] == “bioeconomy”) {
        cat_filter = (bio_input + bio_output + green_energy).split(',');
        cat_filt=[]
        for(i=0;i<cat_filter.length;i++){
            cat_filt.push(cat_filter[i].slice(0,4))
        }
        cat_filter=cat_filt
        console.log(cat_filter)
    //}
    var rates_dict = {};
    var rates_list = [];
    selectedFIPS = fips;
    if(Array.isArray(fips)){
        for (var i = 0; i<fips.length; i++){
            Object.keys(dataSet.industryData.ActualRate).forEach( this_key=>{
                // this_key = parseInt(d.split("$")[1])
                if (keyFound(this_key, cat_filter)){
                    this_rate = dataSet.industryData.ActualRate[this_key]
                    if (this_rate.hasOwnProperty(fips[i])){ 
                        if(rates_dict[this_key]){
                            rates_list.push(rates_dict[this_key]+parseFloat(this_rate[fips[i]][whichVal.node().value]))
                            rates_dict[this_key] = rates_dict[this_key]+parseFloat(this_rate[fips[i]][whichVal.node().value])      
                        }else{
                            rates_dict[this_key] = parseFloat(this_rate[fips[i]][whichVal.node().value])
                            rates_list.push(parseFloat(this_rate[fips[i]][whichVal.node().value]))
                        }
                        
                    } else {
                        if(rates_dict[this_key]){
                            rates_dict[this_key] = rates_dict[this_key]+0.0
                            rates_list.push(rates_dict[this_key]+0.0)
                        }else{
                        rates_dict[this_key] = 0.0
                        rates_list.push(0.0)
                        }
                    }
                }
            })  
        }
    }else if(fips=="state"){
        fips=13
        if(param['census_scope']){
            if(param['census_scope']=="state"){
                Object.keys(dataSet.industryDataStateApi.ActualRate).forEach( this_key=>{
                    if (keyFound(this_key, cat_filter)){
                        this_rate = dataSet.industryDataStateApi.ActualRate[this_key]
                        if (this_rate.hasOwnProperty(fips)){ 
                            rates_dict[this_key] = parseFloat(this_rate[fips][whichVal.node().value])
                            rates_list.push(parseFloat(this_rate[fips][whichVal.node().value]))
                        } else {
                            rates_dict[this_key] = 0.0
                            rates_list.push(0.0)
                        }
                    }
                })
            }
        }else{
            Object.keys(dataSet.industryDataState.ActualRate).forEach( this_key=>{
                if (keyFound(this_key, cat_filter)){
                    this_rate = dataSet.industryDataState.ActualRate[this_key]
                    if (this_rate.hasOwnProperty(fips)){ 
                        rates_dict[this_key] = parseFloat(this_rate[fips][whichVal.node().value])
                        rates_list.push(parseFloat(this_rate[fips][whichVal.node().value]))
                    } else {
                        rates_dict[this_key] = 0.0
                        rates_list.push(0.0)
                    }
                }
            })
        }    

    }else{
        Object.keys(dataSet.industryData.ActualRate).forEach( this_key=>{
            if (keyFound(this_key, cat_filter)){
                this_rate = dataSet.industryData.ActualRate[this_key]
                if (this_rate.hasOwnProperty(fips)){ 
                    rates_dict[this_key] = parseFloat(this_rate[fips][whichVal.node().value])
                    rates_list.push(parseFloat(this_rate[fips][whichVal.node().value]))
                } else {
                    rates_dict[this_key] = 0.0
                    rates_list.push(0.0)
                }
            }
        })
    }

    rates_list = rates_list.sort(function(a,b) { return a - b}).reverse()
    top_data_list = []
    top_data_ids = []
    naCount = 1
    x=Math.min(howMany,rates_list.length)

    if(Array.isArray(fips)){

        for (var i=0; i<rates_list.length; i++) {
            id = parseInt(getKeyByValue(rates_dict, rates_list[i]))
            delete rates_dict[id]
            rateInFips=0
            rateArray={}
            for (var j = 0; j<fips.length; j++){ 
                if(dataSet.industryData.ActualRate[id]){ 
                    if (dataSet.industryData.ActualRate[id].hasOwnProperty(fips[j])) {
                    rateInFips = rateInFips+parseFloat(dataSet.industryData.ActualRate[id][fips[j]][whichVal.node().value])
                    rateArray[j]=parseFloat(dataSet.industryData.ActualRate[id][fips[j]][whichVal.node().value]);
                    naicscode = dataSet.industryData.ActualRate[id][fips[j]]['relevant_naics']
                    } 
                }
            }

            if(dataNames[id]){
                if (rateInFips == null) {
                    rateInFips = 1
                    top_data_list.push(
                        {'data_id': dataNames[id], [whichVal.node().value]: 1,'NAICScode': 1, 'rank': i}
                    )
                }  else {
                    top_data_list.push(
                        {'data_id': dataNames[id], [whichVal.node().value]: rateInFips,'NAICScode': naicscode, 'rank': i, 'ratearray':rateArray}
                    )
                    top_data_ids.push(id)
                }
            }
        }
            
    }else{
        if(fips==13){
            if(param['census_scope']){
                if(param['census_scope']=="state"){
                    for (var i=0; i<x; i++) {
                        id = parseInt(getKeyByValue(rates_dict, rates_list[i]))
                        delete rates_dict[id]

                        if (dataSet.industryDataStateApi.ActualRate[id].hasOwnProperty(fips)) {
                            rateInFips = dataSet.industryDataStateApi.ActualRate[id][fips][whichVal.node().value]
                            naicscode = dataSet.industryDataStateApi.ActualRate[id][fips]['relevant_naics']
                        } else {
                            rateInFips = 0
                        }
                        

                        if (rateInFips == null) {
                            rateInFips = 1
                            top_data_list.push(
                                {'data_id': dataNames[id], [whichVal.node().value]: 1,'NAICScode': 1, 'rank': i}
                            )
                        }  else {
                            top_data_list.push(
                                {'data_id': dataNames[id], [whichVal.node().value]: rateInFips,'NAICScode': naicscode, 'rank': i}
                            )
                            top_data_ids.push(id)
                        }
                    }
                }
            }else{
                for (var i=0; i<x; i++) {
                    id = parseInt(getKeyByValue(rates_dict, rates_list[i]))
                    delete rates_dict[id]

                    if (dataSet.industryDataState.ActualRate[id].hasOwnProperty(fips)) {
                        rateInFips = dataSet.industryDataState.ActualRate[id][fips][whichVal.node().value]
                        naicscode = dataSet.industryDataState.ActualRate[id][fips]['relevant_naics']
                    } else {
                        rateInFips = 0
                    }
                    

                    if (rateInFips == null) {
                        rateInFips = 1
                        top_data_list.push(
                            {'data_id': dataNames[id], [whichVal.node().value]: 1,'NAICScode': 1, 'rank': i}
                        )
                    }  else {
                        top_data_list.push(
                            {'data_id': dataNames[id], [whichVal.node().value]: rateInFips,'NAICScode': naicscode, 'rank': i}
                        )
                        top_data_ids.push(id)
                    }
                }
            }
        }else{
            for (var i=0; i<x; i++) {
                id = parseInt(getKeyByValue(rates_dict, rates_list[i]))
                delete rates_dict[id]

                if (dataSet.industryData.ActualRate[id].hasOwnProperty(fips)) {
                    rateInFips = dataSet.industryData.ActualRate[id][fips][whichVal.node().value]
                    naicscode = dataSet.industryData.ActualRate[id][fips]['relevant_naics']
                } else {
                    rateInFips = 0
                }
                

                if (rateInFips == null) {
                    rateInFips = 1
                    top_data_list.push(
                        {'data_id': dataNames[id], [whichVal.node().value]: 1,'NAICScode': 1, 'rank': i}
                    )
                }  else {
                    top_data_list.push(
                        {'data_id': dataNames[id], [whichVal.node().value]: rateInFips,'NAICScode': naicscode, 'rank': i}
                    )
                    top_data_ids.push(id)
                }
            }
        }
    }


    let icon = "";
    let rightCol = "";
    let midCol="";
    let text = "";
    let dollar = ""; // optionally: $
    let totalLabel = "Total";
    if(String(whichVal.node().value)=="payann"){
        totalLabel = "Total Payroll ($)";
    }
    if(Array.isArray(fips)){
        if (fips.length > 3) {
            $("#infoColumn").hide();
        } else {
            $("#infoColumn").show();
        }
    }else{
        $(".mainColumn1").show();
    }
    d3.csv("data/county_ID_list.csv").then( function(consdata) {

         // TABLE HEADER ROW
        if(Array.isArray(fips) && statelength != fips.length){

            fipslen=fips.length
            for(var i=0; i<fipslen; i++){

                var filteredData = consdata.filter(function(d) {

                    if(d["id"]==fips[i]){
                        if(i==fipslen-1){
                           text += "<div class='cell-right'>" + d["county"].split("County")[0] + " County</div>";
                        
                        }else{
                            text += "<div class='cell-right'>" + d["county"].split(" County")[0] + " County</div>";
                        }
                    }
                })
            }
        }
        text = "<div class='row'><div class='cell'><!-- col 1 --></div><div class='cell'><!-- col 2 --></div>" + text + "<div class='cell-right'>" + totalLabel + "</div><div></div class='cell mock-up' style='display:none'></div>"; // #676464
        
        // INDUSTRY ROWS
        y=Math.min(howMany, top_data_ids.length)
        naicshash=""
        for (i = 0; i < y; i++) { // Naics
            rightCol="";
            midCol="";
            if(String(whichVal.node().value)=="payann"){
                //text += top_data_list[i]['NAICScode'] + ": <b>" +top_data_list[i]['data_id']+"</b>, "+String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": $"+String((top_data_list[i][whichVal.node().value]/1000).toFixed(2))+" million <br>";
                if(Array.isArray(fips)){

                    //if(String((top_data_list[i][whichVal.node().value]/1000).toFixed(2)).length<7){
                    if (1==1) { // Always use million
                        
                        for (var j = 0; j<fips.length; j++){
                            if(top_data_list[i]['ratearray'][j]){
                                    midCol=midCol + "<div class='cell-right'>" + dollar + String((top_data_list[i]['ratearray'][j]/1000).toFixed(2)) + " million</div>";
                            } else {
                                    midCol = midCol +"<div class='cell-right'>0</div>";
                            }    
                        }
                        rightCol = rightCol + "<div class='cell-right'>" + dollar + String((top_data_list[i][whichVal.node().value]/1000).toFixed(2)) + " million</div>";
                    }else{
                        for (var j = 0; j<fips.length; j++){
                            if(top_data_list[i]['ratearray'][j]){
                                
                                    midCol=midCol + "<div class='cell-right'>" + dollar + String((top_data_list[i]['ratearray'][j]/1000000).toFixed(2)) + " million</div>";
                                
                            }else{
                                    midCol = midCol + "<div class='cell-right'>0</div>";
                            }   
                        }
                        // <span style="color: #676464">
                        rightCol += "<div class='cell-right'>" + dollar + String((top_data_list[i][whichVal.node().value]/1000000).toFixed(2)) + " billion</div>";
                    }
                }else{
                    //if(String((top_data_list[i][whichVal.node().value]/1000).toFixed(2)).length<7){
                        rightCol = "<div class='cell-right'>" + dollar + String((top_data_list[i][whichVal.node().value]/1000).toFixed(2))+" million</div>";
                    //}else{
                    //    rightCol = "<div class='cell'>$" + String((top_data_list[i][whichVal.node().value]/1000000).toFixed(2))+" billion</div>";
                    //}
                }
     
            } else {
                //rightCol = String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": "+Math.round(top_data_list[i][whichVal.node().value]);
                if(Array.isArray(fips)){
                    rightCol=""
                    midCol=""
                    for (var j = 0; j<fips.length; j++){
                        if(top_data_list[i]['ratearray'][j]){
                            
                                midCol += "<div class='cell-right'>" + String(Math.round(top_data_list[i]['ratearray'][j])) + "</div>";
                            
                        } else {
                                midCol += "<div class='cell-right'>0</div>";
                        } 
                    }
                    rightCol += "<div class='cell-right'>" + String(Math.round(top_data_list[i][whichVal.node().value])) + "</div>";


                    //rightCol = String(Math.round(top_data_list[i][whichVal.node().value]));
                }else{
                    rightCol = "<div class='cell-right'>" + String(Math.round(top_data_list[i][whichVal.node().value])) + "</div>";
                }
                
            }


            rightCol += "<div class='cell mock-up' style='display:none'><img src='http://localhost:8887/community/impact/img/plus-minus.gif' class='plus-minus'></div>";
            //text += top_data_list[i]['NAICScode'] + ": <b>" +top_data_list[i]['data_id']+"</b>, "+String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": "+Math.round(top_data_list[i][whichVal.node().value])+"<br>";
            
            if(Array.isArray(fips)){
                text += "<div class='row'><div class='cell'>" + icon + top_data_list[i]['NAICScode'] + "</div><div class='cell'>" + top_data_list[i]['data_id'] +"</div>" + midCol + rightCol + "</div>";
            }else{
                text += "<div class='row'><div class='cell'>" + icon + top_data_list[i]['NAICScode'] + "</div><div class='cell'>" + top_data_list[i]['data_id'] + "</div>" + rightCol + "</div>";
            }
            
            document.getElementById("p1").innerHTML = "<div id='sector_list'>" + text + "</div>";
            if(i<5){
                if(i==0){
                    naicshash=naicshash+top_data_list[i]['NAICScode']
                }else{
                    naicshash=naicshash+","+top_data_list[i]['NAICScode']
                }
                
            }
        
        } // End naics rows

        updateHash({"naics":naicshash});
    })
    d3.csv("data/county_ID_list.csv").then( function(consdata) {
        //document.getElementById("industryheader").text = ""; // Clear initial.
        $(".regionsubtitle").text(""); //Clear
        if(Array.isArray(fips) && statelength!=fips.length){
            fipslen=fips.length
            if (param["regiontitle"] == "") {
                $(".regiontitle").text("Industries within "+fipslen+" counties");
            } else {
                $(".regiontitle").text(hash.regiontitle);
            }
            for(var i=0; i<fipslen; i++){
                var filteredData = consdata.filter(function(d) {
                    if(d["id"]==fips[i]){
                        /*
                        if(i==fipslen-1){
                            document.getElementById("industryheader").innerHTML=document.getElementById("industryheader").innerHTML+'<font size="3">'+d["county"]+'</font>'
                        }else if(i==0){
                            document.getElementById("industryheader").innerHTML=document.getElementById("industryheader").innerHTML+'<font size="3">'+d["county"]+', '+'</font>'
                        }else{
                        document.getElementById("industryheader").innerHTML=document.getElementById("industryheader").innerHTML+'<font size="3">'+d["county"]+', '+'</font>'
                        }
                        */
                        $(".regionsubtitle").text($(".regionsubtitle").text() + d["county"] + ", ");
                    }
                })
            }
        }else if(fips==13){
            $(".regiontitle").text("Georgia's Top Industries");
        }else{
            var filteredData = consdata.filter(function(d) {
                if(d["id"]==fips )
                {      
                    $(".regiontitle").text("Industries within "+d["county"]);
                }
            })
        }
    })
    
    //document.getElementById("p1").innerHTML = "tri"
    

    return top_data_list;
}


function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value)
}






