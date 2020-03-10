const fs = require("fs");
const path = require("path");
const glob = require("glob");
const csvToJson = require("csvtojson/v2");

const rows = {};
glob("csv/**/*.csv", async (er, files) => {
    for (let index in files) {
        console.debug(`[glob] Returned file ${files[index]}`);

        const json = await csvToJson().fromFile(files[index]);
        const filePath = path.parse(files[index]);
        const year = filePath.name;
        rows[year] = {};
        for (let row in json) {
            const {make, model, body_styles} = json[row];
            const car = { year, make, model, styles: JSON.parse(body_styles) };
            if (rows[year][make] === undefined) {
                rows[year][make] = [];
            }
            rows[year][make].push(car);
        }
    }
    await fs.writeFile(`json/usa_cars.json`, JSON.stringify(rows), (error, ok) => {
        if (error) {
            console.error(error);
            return;
        }
    })
});
