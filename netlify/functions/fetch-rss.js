import fetch from 'node-fetch';

exports.handler = async function (event, context) {
    const response = await fetch('https://www.nintendolife.com/feeds/latest');
    const data = await response.json();
    console.log(data);

    return {
        statusCode: 200,
        body: JSON.stringify(data)
    };
};