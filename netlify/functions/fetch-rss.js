import fetch from 'node-fetch';

exports.handler = async function (event, context) {
    const response = await fetch('https://www.nintendolife.com/feeds/latest');
    console.log(response);

    return {
        statusCode: 200,
        body: JSON.stringify(response)
    };
};