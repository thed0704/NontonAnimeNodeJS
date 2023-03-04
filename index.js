const http = require("http")
const {Control} = require("./API/control")
const {ControlNNMX} = require("./API/interface/ControlNNMX")

let server = http.createServer()


function getparams(url){
    let u = url.split("/")
    return u
}

server.on("request", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Max-Age', 2592000); // 30 days
    let invresponse = {
        status : 400,
        message : "Invalid request"
    }
    let useragent = req.headers["user-agent"]
    let url = req.url
    url = getparams(url)
    
    if(url[1] == "api"){
        if(url[2] == "OD"){
            if(url[3] == "search"){
                let resq = await Control.search(url[4])
                res.writeHead(200, headers={"Content-Type": "application/json"})
                res.end(JSON.stringify(resq))
            }
            else if(url[3] == "anime"){
                if(url[4] == "info"){
                    let resq = await Control.get_anime_info(url[5])
                    res.writeHead(200, headers={"Content-Type": "application/json"})
                    res.end(JSON.stringify(resq))
                }
                else if(url[4] == "episode"){
                    if(url[5] == "stream"){
                        let resq = await Control.get_episode_stream(url[6], useragent)
                        res.writeHead(200, headers={"Content-Type": "application/json"})
                        res.end(JSON.stringify(resq))
                    }
                    else if(url[5] == "getautostream"){
                        let resq = await Control.get_auto_stream(url[6], useragent)
                        res.writeHead(200, headers={"Content-Type": "application/json"})
                        res.end(JSON.stringify(resq))
                    }
                    else if(url[5] == "getstream"){
                        let resq = await Control.get_stream_list(url[6], useragent)
                        res.writeHead(200, headers={"Content-Type": "application/json"})
                        res.end(JSON.stringify(resq))
                    }
                    else if(url[5] == "getmega"){
                        let resq = await Control.get_mega(url[6], useragent)
                        res.writeHead(200, headers={"Content-Type": "application/json"})
                        res.end(JSON.stringify(resq))
                    }
                    else{
                        let resq = await Control.get_episode_list(url[5])
                        res.writeHead(200, headers={"Content-Type": "application/json"})
                        res.end(JSON.stringify(resq))
                    }
                }
                else{
                    res.writeHead(400, headers={"Content-Type": "application/json"})
                    res.end(JSON.stringify(invresponse))
                }
            }
            else{
                res.writeHead(400, headers={"Content-Type": "application/json"})
                res.end(JSON.stringify(invresponse))
            }
        }
        if(url[2] == "nnmx"){
            if(url[3] == "search"){
                let resq = await ControlNNMX.search(url[4])
                res.writeHead(200, headers={"Content-Type": "application/json"})
                res.end(JSON.stringify(resq))
            }
            else if(url[3] == "anime"){
                if(url[4] == "info"){
                    let resq = await ControlNNMX.get_anime_info(url[5])
                    res.writeHead(200, headers={"Content-Type": "application/json"})
                    res.end(JSON.stringify(resq))
                }
                else if(url[4] == "episode"){
                    if(url[5] == "getstream"){
                        let resq = await ControlNNMX.get_stream_list(url[6], useragent)
                        res.writeHead(200, headers={"Content-Type": "application/json"})
                        res.end(JSON.stringify(resq))
                    }
                    else if(url[5] == "getmega"){
                        let resq = await ControlNNMX.get_stream_list(url[6], useragent)
                        res.writeHead(200, headers={"Content-Type": "application/json"})
                        res.end(JSON.stringify(resq))
                    }
                    else{
                        let resq = await ControlNNMX.get_episode_list(url[5])
                        res.writeHead(200, headers={"Content-Type": "application/json"})
                        res.end(JSON.stringify(resq))
                    }
                }
                else{
                    res.writeHead(400, headers={"Content-Type": "application/json"})
                    res.end(JSON.stringify(invresponse))
                }
            }
            else{
                res.writeHead(400, headers={"Content-Type": "application/json"})
                res.end(JSON.stringify(invresponse))
            }
        }
    }
    else{
        res.writeHead(404)
        res.end("Not Found")
    }
})

server.listen(5000, "0.0.0.0")