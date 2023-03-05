const axios = require("axios");
const { URLSearchParams } = require("url");
const JSSoup = require("jssoup").default;

class NNMX{
    constructor(){
        this.url = "https://nanimex1.com/"
        this.recursivelimit = 5
    }

    async get(url, ua){
        let useragent = ua === "" ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.62 Safari/537.36" : ua;
        let promise = new Promise((resolve) => {
            axios.get(url, {headers : 
                {'User-Agent' : useragent
            }}).then((res) => {
                resolve(res.data)
            }).catch((err) => {
                resolve(err.response.data)
            })
        })

        let data = await promise

        return data
    }

    async post(url, data, ua){
        let useragent = ua === "" ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.62 Safari/537.36" : ua;
        let promise = new Promise((resolve) => {
            axios.post(url, data, {headers :
                {"User-Agent" : useragent
            }}).then((res) => {
                resolve(res.data)
            }).catch((err) => {
                resolve("")
            })
        })

        let data_ = await promise

        return data_
    }

    async search(q, recursive, isRecursive){
        let query = q
        let result = ""
        if(isRecursive){
            result = await this.get(q)
        }
        else{
            result = await this.get(this.url+"/?s="+query)
        }
        result = new JSSoup(result)
        let next = result.find("a", "next")

        if(next){
            next = next.attrs.href
        }

        result = result.find("div", "box-poster")
        result = result.findAll("div", "content-item")

        let data = []

        result.map((d) => {
            let type = d.find("img").attrs.title.split(":")[0].split(" ")[1]
            let img = Buffer.from(d.find("img").attrs.src).toString("base64")
            let href = Buffer.from(d.find("a").attrs.href).toString("base64")
            let title = d.find("h3", "post-title").attrs.title
            let rating = d.find("div", "btn-warning").text
            let status = d.findAll("a", "btn-primary")[1].text

            let items = {
                title: title,
                anime_id: href,
                img: img, 
                genre: ["Unknown"],
                status: status,
                rating: rating
            }
            if(type === "Anime"){
                data.push(items)
            }
        })

        if(recursive < this.recursivelimit && next){
            //console.log(next)
            let recurs = await this.search(next, recursive += 1, true)
            data = [].concat(data, recurs)
        }
        return data
    }

    async get_episode_list(href){
        href = Buffer.from(href, "base64").toString("ascii")
        if(/movie/.test(href)){
            return false
        }
        let result = await this.get(href, "")
        let batch = {}
        let episode = []
        result = new JSSoup(result)
        result = result.find("div", "episode_list")
        result = result.findAll("a")
        result.map((d)=>{
            let text = d.text
            let href_ = Buffer.from(d.attrs.href).toString("base64")
            let eps = {
                text: text,
                episode_id: href_
            }
            episode.push(eps)
            
        })

        let bundle = {
            episode_list: episode,
            batch: batch
        }
        return bundle
    }

    async get_anime_info(href){
        href = Buffer.from(href, "base64").toString("ascii")
        if(/movie/.test(href)){
            return false
        }
        let result = await this.get(href, "")
        result = new JSSoup(result)
        let sinopc = result.find("div", "attachment-text").text
        let img = Buffer.from(result.find("img", "attachment-img").attrs["data-lazy-src"]).toString("base64")
        let info = result.find("table","table-condensed")
        let infos = {}
        info = info.findAll("tr")
        info.map((d) => {
            let field = d.findAll("td")
            let field_1 = field[0].text
            let field_2 = ""
            if(field_1 === "Genre"){
                let genres = field[1].findAll("a")
                for(let i = 0; i < genres.length; i++){
                    field_2 = field_2 + genres[i].text
                    if(i != (genres.length-1)){
                        field_2 = field_2 + ","
                    }
                }
            }
            else{
                field_2 = field[1].text
            }
            infos[field_1] = field_2
        })

        result = {
            img: img,
            info: infos,
            sinopsis: sinopc
        }
        return result
    }

    async get_episode_stream_list(href){
        href = Buffer.from(href, "base64").toString("ascii")
        let result = await this.get(href)
        let stream_list = []
        result = new JSSoup(result)
        result = result.find("select", {id:"change-server"})
        result = result.findAll("option")
        result.map((d) => {
            let quality = d.text.split(/\ /)[0].replace("p", "");
            let server = d.text.split(/\ /)[1]
            quality = parseInt(quality)
            let items = {
                quality: quality,
                data_content: d.attrs.value
            }
            if(/uservideo/.test(server)){
                stream_list.push(items)
            }
        })

        return stream_list
    }

    async uservideo_extractor(href, useragent){
        let result = await this.get(href, useragent)
        console.log(result)
        if(/Just a moment/.test(result)){
            console.log("OK")
            return href
        }
        result = new JSSoup(result)
        result = result.findAll("script")[1].attrs.src
        result = result.match(/https:\/\/[a-zA-Z0-9\.\/\?\=\&\-\,\_\^\+]+/).toString()
        return result
    }
    
    async eps_title(href){
        href = Buffer.from(href, "base64").toString("ascii")
        let result = await this.get(href)
        result = new JSSoup(result)
        result = result.find("h1").text
        return result
    }

}

exports.NNMX = NNMX
