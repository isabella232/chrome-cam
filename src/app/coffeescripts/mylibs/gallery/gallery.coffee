define [
    'Kendo'
    'mylibs/utils/utils'
    'mylibs/file/filewrapper'
    'text!mylibs/gallery/views/row.html'
], (kendo, utils, filewrapper, template) ->
    
    pageSize = 12
    ds = {}
    data = []
    container = {}
    el = {}
    selected = {} 
    total = 0
    index = 0
    flipping = false
    pages = 
        previous: {}
        next: {}

    animation = 
        effects: "pageturn:horizontal"
        reverse: false
        duration: 800      

    page = (direction) =>

        # TODO: add transition effect...
        if direction > 0 and @ds.page() > 1
            animation.reverse = true
            @ds.page @ds.page() - 1
        if direction < 0 and @ds.page() < @ds.totalPages()
            animation.reverse = false
            @ds.page @ds.page() + 1

    destroy = ->

        name = selected.children(":first").data("file-name")
        
        selected.kendoStop(true).kendoAnimate
            effects: "zoomOut fadOut"
            hide: true
            complete: ->
                filewrapper.deleteFile(name).done => 
                    selected.remove()
                    @ds.remove(@ds.get(name))

    get = (name) => 
        # find the match in the data source
        match = @ds.get(name)
        # now get its index in the current view
        index = @ds.view().indexOf(match)
        # the actual index of this item in relation to the whole set
        # of data is the page number times. it's zero based so we have to do
        # some funky calculations
        position = if @ds.page() > 1 then pageSize * (@ds.page() - 1) + index else index 
        return { length: @ds.data().length, index: position, item: match }

    at = (index) =>
        # we may need to page the data before grabbing the item.
        # to get the current page, divide the index by the pageSize. then
        target = Math.ceil((index + 1) / pageSize)
        # go ahead and go to that page if needed
        if (target != @ds.page()) then @ds.page(target)
        # the actual index of the item within the page has to be recalculated if
        # the current page is greater than 1
        position = if target > 1 then index - pageSize else index
        # now we can search the current datasource view for the item at the correct index
        match = { length: @ds.data().length, index: index, item: @ds.view()[position] }
        $.publish "/details/update", [match]

    add = (item) =>
        @ds.add(name: item.name, file: item.file, type: item.type)

    pub =

        before: (e) ->

            container.parent().height($(window).height() - 50)
            container.parent().width($(window).width())

            # pause the camera. there is no need for it
            # right now.
            $.publish "/postman/deliver", [{ paused: true }, "/camera/pause"]

        hide: (e) ->
            $.publish "/postman/deliver", [{ paused: false }, "/camera/pause"]

        swipe: (e) ->
            
            page (e.direction == "right") - (e.direction == "left")

        init: (selector) =>

            # create the pages that hold the thumbnails
            # in order to page through previews, we need to create two pages. the current
            # page and the next page.
            page1 = new kendo.View(selector, null)
            page2 = new kendo.View(selector, null)

            # get a reference to the view container
            container = page1.container

            pages.previous = page1.render().addClass("page gallery")
            pages.next = page2.render().addClass("page gallery")

            #delegate some events to the gallery
            page1.container.on "dblclick", ".thumbnail", ->
                thumb = $(this).children(":first")            
                $.publish "/details/show", [ get("#{thumb.attr("name")}") ]

            page1.container.on "click", ".thumbnail", ->
                thumb = $(this).children(":first")            
                $.publish "/top/update", ["selected"]
                page1.find(".thumbnail").removeClass "selected"
                selected = $(@).addClass "selected"
                $.publish "/item/selected", [get("#{thumb.attr("name")}")]

            $.subscribe "/pictures/bulk", (message) =>
                @ds = new kendo.data.DataSource
                    data: message.message
                    pageSize: 12
                    change: ->

                        loaded = 0
                        thumbs = []

                        for item in @.view()
                            thumbnail = $("<div class='thumbnail'></div>")
                            thumbs.push({ thumbnail: thumbnail, data: item })

                            pages.next.append(thumbnail)

                        # move the current page out and the next page in
                        container.kendoAnimate {
                            effects: animation.effects
                            face: if animation.reverse then pages.next else pages.previous
                            back: if animation.reverse then pages.previous else pages.next
                            duration: animation.duration
                            reverse: animation.reverse
                            complete: =>

                                for item in thumbs

                                    do ->
                                        element = {}
                                        if item.data.type == "webm"
                                            element = document.createElement "video"
                                        else 
                                            element = new Image()
                                        
                                        element.src = item.data.file
                                        element.name = item.data.name
                                        element.width = 250
                                        element.height = 167
                                        
                                        element.setAttribute("class", "hidden")
                                        element.onload = ->
                                            $(element).kendoAnimate {
                                                effects: "fadeIn",
                                                show: true
                                            }

                                        item.thumbnail.append(element)

                                # the current page becomes the next page
                                justPaged = pages.previous

                                pages.previous = pages.next
                                pages.next = justPaged

                                justPaged.empty()

                                flipping = false


                        }

                                            
                    sort:
                        dir: "desc" 
                        field: "name"  
                    schema: 
                        model:
                            id: "name" 

                @ds.read()

            $.subscribe "/gallery/delete", ->
                destroy()

            $.subscribe "/gallery/add", (item) ->
                add(item)

            $.subscribe "/gallery/at", (index) ->
                at(index)

            $.publish "/postman/deliver", [ {}, "/file/read" ]

            return gallery
