import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import styles from "../style/app.module.css";
import { getParkList } from "../util/api";


export const RandomMarkerInMapBounds = () => {
    const map = useMap();
    const ref = useRef({
        location: null
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        map.locate({
            setView: true
        })
        setIsLoading(true);
    }, [map])

    useEffect(() => {
        if (!map) return;

        if (document.querySelectorAll(".description").length > 0) return;

        const legend = L.control({ position: "bottomleft" });

        legend.onAdd = function () {
            let div = L.DomUtil.create("div", "description");
            L.DomEvent.disableClickPropagation(div);
            const text = "List of Park Within Radius, Click on the Markers to Know the Detail Address";
            div.insertAdjacentHTML("beforeend", text);
            return div;
        };

        legend.addTo(map);

        // add "random" button
        const dropDownTemplate = `
        <div class="${styles['select-dropdown']}">
        <label for="select-radius">Select Radius: </label>
        <select id="select-radius">
            <option value="5000">5 KM</option>
            <option value="15000">15 KM</option>
            <option value="30000">30 KM</option>
            <option value="40000">40 KM</option>
        </select>
    </div>
        `;

        // create custom button
        const customControl = L.Control.extend({
            // button position
            options: {
                position: "topright",
                title: "Select Radius",
                className: styles.leafletRandomMarker,
            },

            // method
            onAdd: function (map) {
                this._map = map;
                return this._initialLayout();
            },

            _initialLayout: function () {
                // create button
                const container = L.DomUtil.create(
                    "div",
                    this.options.className
                );
                this._container = container;

                L.DomEvent.disableClickPropagation(container);

                container.title = this.options.title;
                container.innerHTML = dropDownTemplate;

                // action when select on drop down list
                // clear and add new park list marker
                L.DomEvent.on(
                    container.querySelector('#select-radius'),
                    "change",
                    L.DomEvent.stopPropagation
                )
                    .on(container.querySelector('#select-radius'), "change", L.DomEvent.stop)
                    .on(container.querySelector('#select-radius'), "change", removeMarkers)
                    .on(container.querySelector('#select-radius'), "change", (item) => {
                        setIsLoading(true);
                        randomMarker(ref.current.location, item.target.value);
                    });

                return this._container;
            },
        });

        // adding new button to map controll
        map.addControl(new customControl());

        // random color
        // ------------------------------
        const randomColor = () => Math.floor(Math.random() * 16777215).toString(16);

        // add feature group to map
        const fg = L.featureGroup().addTo(map);

        // create random marker
        async function randomMarker(latLng, radius = 5000) {

            if (!latLng) return;

            try {

                // Get ParkList from API
                const parkList = await getParkList(`${latLng.lng},${latLng.lat},${radius}`);

                setIsLoading(false);

                if ('features' in parkList && Array.isArray(parkList['features'])) {

                    let allPoints = [];
                    let allPointsDetails = [];

                    // generate random points and add to array 'allPoints'
                    for (let i = 0; i < parkList['features'].length; i++) {
                        let points = parkList['features'][i]['geometry']['coordinates'].reverse();
                        allPoints.push(points);
                        allPointsDetails.push(parkList['features'][i]['properties']['formatted']);
                    }

                    // add markers to feature group
                    for (let i = 0; i < allPoints.length; i++) {
                        L.marker(allPoints[i], {
                            icon: L.divIcon({
                                className: "custom-icon-marker",
                                iconSize: L.point(40, 40),
                                html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="marker"><path fill-opacity="0.25" d="M16 32s1.427-9.585 3.761-12.025c4.595-4.805 8.685-.99 8.685-.99s4.044 3.964-.526 8.743C25.514 30.245 16 32 16 32z"/><path stroke="#fff" fill="#${randomColor()}" d="M15.938 32S6 17.938 6 11.938C6 .125 15.938 0 15.938 0S26 .125 26 11.875C26 18.062 15.938 32 15.938 32zM16 6a4 4 0 100 8 4 4 0 000-8z"/></svg>`,
                                iconAnchor: [12, 24],
                                popupAnchor: [9, -26],
                            }),
                        })
                            .bindPopup(`<b>Details: </b>:<br>${allPointsDetails[i]}`)
                            .addTo(fg);
                    }
                    // zoom to feature group and add padding
                    map.fitBounds(fg.getBounds(), { padding: [20, 20] });
                }

            } catch (e) {
                setIsLoading(false);
            }
        }

        //  remove markers from feature group
        function removeMarkers() {
            fg.clearLayers();
        }

        // initialize random marker
        map.on('locationfound', (event) => {
            ref.current.location = event.latlng;
            randomMarker(event.latlng);
        })
    }, [map]);

    return isLoading ? <div style={{
        "zIndex": "99999",
        "position": "absolute",
        "background": "#80808094",
        "width": "100%",
        "height": "100%",
        "pointerEvents": "none",
        "display": "flex",
        "justifyContent": "center",
        "alignItems": "center"
    }}>
        <img src="https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif" alt="loader" />
    </div> : null;
};