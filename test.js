console.log(require('constants').SSL_OP_NO_TLSv1_2);
require('request')({ method: 'POST',
  body: 't=EwAwA06hBwAUbl/sgipYGM8TysUFtClJteGnuzoAASaWjfuYXEj5bf3mS1R9iHanhgNOVw4RglN7NZbjzxiH9EVXHr6guvk0ImTMoSYRPrWypATdjscr+8vsCRGP3yTRz7d8wXreZvanUvXhNT1c05sToi4mNwdcCL6JjglUT+2DWJt480zza57YkSuiK34TqV/qpO7mvcmvHqxLEqHFdH3MABW2Vi7vWR2lCwzIdSg7kXWVNGYtrMf0M0+Cz9FqU1MDFzKJ5iQdP3Fe/qaklmi/6so7ZWXI38ftPIdq8mAZDqdXYhvUyMdmLUjgH/zTUm8qZ+KDEXjByRfDt8ji3e5UWBJLkSP8rSX8dpsZ35X8T+TLhxiPPqScpmEyaoADZgAACDEjiUz6w+lyAALYZ6jlnWjeeeBu+12omO/rbyI9lyhzLlKLC0VGmnfubMKdRSZjn8HVc9Hp/HmVgwtM2uOXWdRk+/x99dBrbaHUih8LTYl8nVL9PHy6/pj5yKPSBQQqdD52LPst57TtWGXjNv8YzzXlD05IVDA0zGBlWaTu1BE2IDCPoQfptirN4wQC9U7g391kuMJbr7T1tTq21WSmd+V52tmjRkrLoIHFlbTVhaFXbADuQW328BR56HuUd7BHC8UVtVbxjsMvHwvmXGe6Xc6U4GWlk+s2tI6PDJ0DiIlk0+fzaryapz+UuYzrJwq6oiM/DLABy7zosmX7EDmukGDnqA/IwT8QRQpxFgZN+CcAraP99ykE/SwUFCU43hPQscIFdLs2PAHqWFiVumz2aKCYhn8vnRPxDw5QdTuuknZ3gwjF0D7W8oOItUfWs3GU7kCxKjCbzBa3qS70CNQ6MltJGEGpfJY5y5GM2QVddih3DcjEQ/73ME9wH/5H2dGianJhBJmu91wSGKp99Q2tIiKMh6W1iMph9O+0pp02P7AER+6LJxKI4uDDsVx3Q7iJIo3nqCEmHn8xRK5/5+bIQyRop3/8HFTfog+IGthUVbc9v6Tl5+BIb+GXcv8z5Kz58xbgL1t12LzTBKe3J6XSSUmXhVREBlFVv91FVq24w6yTkBzgt04PcB9wsG0C&amp;p=',
  url: 'https://redhatmobile-my.sharepoint.com/_forms/default.aspx?wa=wsignin1.0',
  //url : 'http://www.microsoft.com/',
  //proxy : 'http://127.0.0.1:8080',
  headers : {
    'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0)'
  },
  secureOptions: require('constants').SSL_OP_NO_TLSv1_2,
  strictSSL : false,
  // agentOptions : {
  //   securityOptions: require('constants').SSL_OP_NO_TLSv1_2
  // },
  followRedirect: false,
  followAllRedirects : false
}, function(err, response, body){
  console.log(response.headers);
console.log(err);
console.log(body);
});
