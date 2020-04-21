require('dotenv').config();

const TelegramBot = require("node-telegram-bot-api");
const token = process.env.TOKEN;
const axios = require("axios");
const API = process.env.URL
const Product = process.env.PRODUK
const bot = new TelegramBot(token, {polling:true})

let keranjang = [];
let total = 0;

const welcomebot = `Selamat Datang !\nUntuk memudahkan kamu dalam berbelanja, \nSilahkan daftar terlebih dahulu ya`
const Deksripsi = '/description'
const Checkcart = '/keranjang'
const Bantuan = '/help'
const Listbarang = '/product'
const Profil = '/me'
const Daftar = '/register'

    bot.onText(/\/start|\halo|\hi|\hy|\hai/, (msg) => {
        bot.sendMessage(msg.chat.id, `Halo ${msg.chat.last_name} ${welcomebot}\n Silahkan ikuti format berikut :\n${Daftar} Zulfadli - zulfadli48 - ipay48@gmail.com - 085760860595`)
        bot.sendMessage(msg.chat.id, `Tentang Toko Ini ${Deksripsi}`)
        bot.sendMessage(msg.chat.id, `Temukan yang kamu butuhkan disini ${Bantuan}`)
  });

//deskripsi produk
bot.onText(/\/description/, msg => {
    bot.sendMessage(msg.chat.id, `Ipay'store`)
})

bot.onText(/\/help/, msg => {
    bot.sendMessage(msg.chat.id, `*Selamat Datang di Pusat Bantuan Toko Kami, Silahkan temukan yang kamu butuhkan disini*
                                    =======================================================`)
    bot.sendMessage(msg.chat.id, `Untuk Melihat detail profil ${Profil}`)
    bot.sendMessage(msg.chat.id, `Untuk Order, silahkan ke sini ${Listbarang}`)

})

  // Request List Produk
    bot.onText(/\/product/, msg => {
    let inline_keyboard = (item) => [
        [
            {
                text: "Tambah Ke Keranjang",
                callback_data: JSON.stringify(item.keranjang)
            }
        ]
    ]

    axios.get(API + Product)
        .then(response => { 
            const data = response.data.data
            data.forEach(item => { 
                let row = {
                    keranjang: {
                        id: item.id,
                        action: 'cart'
                    }
                        }
                bot.sendMessage(msg.chat.id,
                    `*Nama*: ${item.name}
                                                *Harga*: Rp. ${item.price}`,
                    {
                        reply_markup: {
                            inline_keyboard: inline_keyboard(row)
                        },
                        parse_mode: "Markdown"
                    }
                )
                    
            });
        }).catch(err => {
            console.log(err.message)
        })
})

bot.on("callback_query", function onCallbackQuery(callbackQuery){
    const action = JSON.parse(callbackQuery.data)
    const msg = callbackQuery.message
    let x = {
        keranjang: {
            id: action.id,
            action: 'cart'
    }
}
const opts1 = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
	reply_markup: {
		inline_keyboard: [[
			{
				text: "Tambah Ke Keranjang",
				callback_data: JSON.stringify(x.keranjang)
			}
		]]
	}
  };
  const opts2 = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };
  let text;
	
	axios.get(API + Product + action.id)
		.then(response => {
				if (keranjang.length == 0) {
					keranjang.push({
						name: response.data.data.name,
						price: response.data.data.price,
						quantity: 1
					});
					text = `Product berhasil ditambahkan ke keranjang, 
Silahkan cek keranjang belanja anda ${Checkcart}`;
					bot.editMessageText(text, opts2);
				}
				else {
					let i = keranjang.findIndex(item => item.name == response.data.data.name);
					if (i != -1) {
						keranjang[i].quantity += 1;
                        text = `Product berhasil ditambahkan ke keranjang, 
Silahkan cek keranjang belanja anda ${Checkcart}`;
						bot.editMessageText(text, opts2);
					}
					else {
						keranjang.push({
							name: response.data.data.name,
							price: response.data.data.price,
							quantity: 1
						});
                        text = `Product berhasil ditambahkan ke keranjang, 
Silahkan cek keranjang belanja anda ${Checkcart}`;
						bot.editMessageText(text, opts2);
						
					}
				}
		})
		.catch(err => {
			console.log(err.message);
		});
});

// Check Cart
bot.onText(/\/keranjang/, msg => {
    let data = JSON.stringify(keranjang)
    for (let i = 0; i < keranjang.length; i++) {
        total+= keranjang[i].quantity * keranjang[i].price
    }
    bot.sendMessage(msg.chat.id, `Berikut Ini List Belanjaan kamu :  
*${data}* 
Total Belanja Kamu Sebesar Rp. *${total}*`, { parse_mode: "Markdown" }
    )
})

//daftar akun
bot.onText(/\/register (.+)/, async (msg, data)=> {
    const [full_name,username,email,phone_number] = data[1].split('-')

    try{
        const response = await axios.post (API + CUSTOMER, {
            "data" :{
                "attributes": {
                    "id": msg.from.id,
                    "full_name": full_name,
                    "username": username,
                    "email": email,
                    "phone_number": phone_number
                }
            }
        })
        bot.sendMessage(msg.chat.id, `Yeay pendaftaran kamu berhasil, silahkan lihat detail profil kamu /me\n atau ingin melakukan order silahkan lihat list produk ${Listbarang}`)
    } catch (error){
        console.log(error)
        bot.sendMessage(msg.chat.id, 'Kamu telah terdaftar')
    }
})


bot.onText(/\/me/, async (msg)=>{
    const id = msg.from.id
    try {
        const response = await axios.get(API + CUSTOMER + id )
        bot.sendMessage(msg.chat.id, `Berikut detail profil kamu : \nNama : ${response.data.data.full_name} \nUsername: ${response.data.data.username}\nEmail: ${response.data.data.email}\nPhone number: ${response.data.data.phone_number}.`, {
            parse_mode:'Markdown'
        })
    } catch (error) {
        console.log(error);
        bot.sendMessage(msg.chat.id, `Maaf, kamu belum terdaftar disistem kami.\nSilahkan mendaftar dengan mengirimkan data dengan format berikut : \n/daftar *nama*-*username*-*email*-*phone number*\nContoh : /daftar *Zulfadli*-*zulfadli*-* ipay48@gmail.com*-*085760860595*`,{
            parse_mode:"Markdown"
        })
    }
})