import{r as e,X as l,j as t,C as r,M as o}from"./index-BKfk211y.js";import i from"./Row-DLaeMOO_.js";const d=c=>e.createElement("svg",{id:"Layer_1",xmlns:"http://www.w3.org/2000/svg",xmlnsXlink:"http://www.w3.org/1999/xlink",x:"0px",y:"0px",viewBox:"0 0 1949.9 634.4",style:{enableBackground:"new 0 0 1949.9 634.4"},xmlSpace:"preserve",...c},e.createElement("style",{type:"text/css"},`\r
		.distance-0 {\r
			fill: none;\r
			stroke: #107895;\r
			stroke-width: 40;\r
			stroke-linejoin: round;\r
			stroke-miterlimit: 133.3333;\r
		}\r
\r
		.distance-1 {\r
			fill: none;\r
			stroke: #107895;\r
			stroke-width: 40;\r
			stroke-linecap: round;\r
			stroke-linejoin: round;\r
			stroke-miterlimit: 133.3333;\r
		}\r
	`),e.createElement("path",{d:"M1721.9,0c-125.6,0-227.8,102.2-227.8,227.8c0,51.4,36.1,134.6,107.2,247.1c51.9,82.2,104.6,151.2,105.2,151.9 c3.7,4.8,9.4,7.6,15.5,7.6s11.7-2.8,15.5-7.6c0.5-0.7,53.3-69.6,105.2-151.9c71.1-112.5,107.2-195.6,107.2-247.1 C1949.7,102.3,1847.6,0,1721.9,0z M1721.9,582.5c-64.2-87.2-188.9-272.9-188.9-354.7c0-104.2,84.7-188.9,188.9-188.9 s188.9,84.7,188.9,188.9C1910.9,309.6,1786.3,495.4,1721.9,582.5z"}),e.createElement("path",{d:"M1722.1,99.6c-75.3,0-136.5,61.3-136.5,136.5s61.3,136.5,136.5,136.5s136.5-61.3,136.5-136.5S1797.4,99.6,1722.1,99.6z  M1722.1,333.8c-53.9,0-97.6-43.9-97.6-97.6s43.9-97.6,97.6-97.6c53.9,0,97.6,43.9,97.6,97.6S1776,333.8,1722.1,333.8z"}),e.createElement("path",{d:"M793.3,292.5h-52.4c-10.7,0-19.4,8.7-19.4,19.4c0,10.7,8.7,19.4,19.4,19.4h52.4c10.7,0,19.4-8.7,19.4-19.4 C812.7,301.3,804,292.5,793.3,292.5z"}),e.createElement("path",{d:"M983,292.5h-52.4c-10.7,0-19.4,8.7-19.4,19.4c0,10.7,8.7,19.4,19.4,19.4H983c10.7,0,19.4-8.7,19.4-19.4 C1002.4,301.3,993.8,292.5,983,292.5z"}),e.createElement("path",{d:"M1172.7,292.5h-52.4c-10.7,0-19.4,8.7-19.4,19.4c0,10.7,8.7,19.4,19.4,19.4h52.4c10.7,0,19.4-8.7,19.4-19.4 C1192.1,301.3,1183.4,292.5,1172.7,292.5z"}),e.createElement("path",{d:"M1388.3,295.3H1317c-14.6,0-26.4,8.7-26.4,19.4c0,10.7,11.9,19.4,26.4,19.4h71.4c14.6,0,26.4-8.7,26.4-19.4 C1414.8,304.1,1403.1,295.3,1388.3,295.3z"}),e.createElement("g",null,e.createElement("path",{className:"distance-0",d:"M543.4,210.7V466c0,60.2,0,90.3-18.7,109c-18.7,18.7-48.8,18.7-109,18.7h-31.9H256.2h-31.9 c-60.2,0-90.3,0-109-18.7c-18.7-18.7-18.7-48.8-18.7-109V210.7"}),e.createElement("path",{className:"distance-1",d:"M32.8,274.5l143.6-127.7l101.2-90c24.2-21.5,60.6-21.5,84.8,0l101.2,90l143.6,127.7"}),e.createElement("path",{className:"distance-1",d:"M256.2,593.7V466c0-35.3,28.6-63.8,63.8-63.8l0,0c35.3,0,63.8,28.6,63.8,63.8v127.7"})),e.createElement("path",{d:"M1377.7,312.9l-62.4,62.4c-12.7,12.7-16.9,29.2-9.4,36.8s24.1,3.4,36.8-9.4l62.4-62.4c12.7-12.7,16.9-29.2,9.4-36.8 C1407,296.1,1390.6,300.1,1377.7,312.9z"}),e.createElement("path",{d:"M1405.2,283.4l-62.4-62.4c-12.7-12.7-29.2-16.9-36.8-9.4s-3.4,24.1,9.4,36.8l62.4,62.4c12.7,12.7,29.2,16.9,36.8,9.4 C1422,312.7,1418,296.3,1405.2,283.4z"}));function p({sCity:c=o,eCity:n,className:s=""}){const a=l(c.coordinates[1],c.coordinates[0],n.coordinates[1],n.coordinates[0]);return t.jsxs(i,{className:`city-row ${s} row--wrap`,children:[t.jsxs("div",{className:"city-row__city",children:[t.jsxs("b",{children:[t.jsx(r,{countryId:c.country.id}),c.name]}),t.jsx(d,{className:"city-row__icon"}),t.jsxs("b",{children:[t.jsx(r,{countryId:n.country.id}),n.name]})]}),t.jsxs("b",{className:"city-row__distance",children:[a.toFixed(2)," km"]})]})}export{p as default};
