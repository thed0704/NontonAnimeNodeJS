const {Anime} = require("./core")

class ControlOD{
    constructor(){
        this.Anime = new Anime.OD();
    }

    async search(q){
        let res = await this.Anime.search(q)
        let response = {}
        if(res.length != 0){
            response = {
                status : 200,
                data  : res
            }
            return response
        }
        else{
            response = {
                status : 404,
                message : q+" was not found"
            }

            return response
        }
    }

    async get_anime_info(href){
        let response = {}
        try{
            let res = await this.Anime.get_anime_info(href)
            response = {
                status : 200,
                data  : res
            }
            return response
        }catch{
            response = {
                status : 400,
                message : "Invalid request"
            }
            return response
        }
    }

    async get_episode_list(href){
        let response = {}
        try{
            let res = await this.Anime.get_episode_list(href)
            response = {
                status : 200,
                data  : res
            }
            return response
        }catch{
            response = {
                status : 400,
                message : "Invalid request"
            }
            return response
        }
    }

    async get_episode_stream(href, useragent){
        try{
            let res = await this.Anime.get_episode_stream_list(href)
            let buffer = {}
            let keys = Object.keys(res)
            for (let j = 0; j < keys.length;j++){
                let item = []
                for(let i = 0; i < res[keys[j]].length; i++) {
                    let stream = await this.Anime.get_stream(res[keys[j]][i].data_content, useragent)
                    let items = {
                        stream_link: stream,
                        server: res[keys[j]][i].server
                    }
                    item.push(items)
                }
                buffer[keys[j]] = item
            }

            let response = {
                status: 200,
                data: buffer
            }
            return response
        }catch (err){
            let response = {
                status : 400,
                message : "Invalid request"
            }
            return response
        }
    }

    async get_auto_stream(href, useragent){
        try{
            let res = await this.Anime.get_episode_stream_list(href)
            let response = ""
            if(res.hasOwnProperty("m480p")){
                response = await this.Anime.get_stream(res["m480p"][0].data_content, useragent)
            }
            else{
                let i = Object.keys(res)
                response = await this.Anime.get_stream(res[i[0]][0].data_content, useragent)
            }
            let r = {
                status: 200,
                data: response
            }
            return r
        }catch (err){
            let response = {
                status : 400,
                message : "Invalid request"
            }
            return response
        }
    }

    async get_stream_list(href, useragent){
        try{
            let res = await this.Anime.get_episode_stream_list(href)
            let quality_list = Object.keys(res)
            let stream_list = []
            for(let i = 0; i < quality_list.length; i++){
                let q = quality_list[i]
                q = q.replace(/m/, "")
                q = q.replace(/p/, "")
                q = parseInt(q)
                if(res[quality_list[i]] != 0 ){
                    stream_list.push({
                        quality:q,
                        stream: await this.Anime.get_stream(res[quality_list[i]][0].data_content, useragent)
                    })
                }
            }
            let r = {
                status: 200,
                data: stream_list
            }

            return r
        }catch{
            let response = {
                status : 400,
                message : "Invalid request"
            }
            return response
        }
    }

    async get_mega(href, useragent){
        try{
            let res = await this.Anime.get_episode_stream_list(href)
            let quality_list = Object.keys(res)
            let stream_list = []
            for(let i = 0; i < quality_list.length; i++){
                let q = quality_list[i]
                q = q.replace(/m/, "")
                q = q.replace(/p/, "")
                q = parseInt(q)
                let mega = ""
                for(let j = 0; j < res[quality_list[i]].length; j++){
                    //console.log(res[quality_list[i]][j].server)
                    if(res[quality_list[i]][j].server.trim() === "mega"){
                        stream_list.push({
                            quality:q,
                            stream: await this.Anime.get_stream(res[quality_list[i]][j].data_content, useragent)
                        })
                    }
                }
            }
            let r = {
                status: 200,
                data: stream_list
            }

            return r
        }
        catch{
            let response = {
                status : 400,
                message : "Invalid request"
            }
            return response
        }

    }

    async get_title(href){
        try{
            let r = {
                status: 200,
                data: await this.Anime.eps_title(href)
            }
            return r
        }catch{
            let response = {
                status : 400,
                message : "Invalid request"
            }
            return response
        }
    }


}


exports.Control = new ControlOD()