import { loadEnvConfig } from '@next/env';

// Load environment variables from .env.local
loadEnvConfig(process.cwd());

async function main() {
  console.log('🌱 Seeding team members...');

  const { db } = await import('./index');
  const { teamMembers } = await import('./schema');

  const EC_MEMBERS = [
    { name: "Samaksh Gupta", role: "Chairperson", image: "https://images.prismic.io/ieeemuj/ZnJjw5m069VX13S1_IMG-20240405-WA0024~2-SamakshGupta.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/samakshgupta04", github: "https://github.com/AwesomeSam9523/", instagram: "https://www.instagram.com/samaksh.gupta04?igsh=c252dTcwNjZldWRp" },
    { name: "Tamanna Yadav", role: "Vice Chairperson", image: "https://images.prismic.io/ieeemuj/ZnHEBZm069VX12wA_IMG_20240617_153104-TamannaYadav.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/tamanna-yadav-4251a6234", github: "", instagram: "https://www.instagram.com/tamanna.yadav_?igsh=MWl3Ym16bDMyOHBtZg==" },
    { name: "Salaj Singh Bisht", role: "General Secretary", image: "https://images.prismic.io/ieeemuj/ZnHLL5m069VX12yn_IMG_20240416_161408-SalajBisht.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/salaj-singh-bisht-837899248", github: "", instagram: "https://instagram.com/_.bishttt._" },
    { name: "Aryan Verma", role: "Managing Director", image: "https://images.prismic.io/ieeemuj/aENAFrh8WN-LVx3f_IMG_0788-AryanVerma.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/aryannnnverma", github: "https://github.com/aryannverse", instagram: "https://www.instagram.com/aryannverse" },
    { name: "Vinayak Jajoo", role: "Treasurer", image: "https://images.prismic.io/ieeemuj/aENAfrh8WN-LVx4C_IMG_6284-VinayakJajoo.heic?auto=format,compress", linkedin: "https://www.linkedin.com/in/vinayak-jajoo-414823250", github: "", instagram: "https://www.instagram.com/vinayakjajoo" },
    { name: "Bhavya Jaggi", role: "Human Resource Director", image: "https://images.prismic.io/ieeemuj/aEM_tbh8WN-LVx3E_20250421_183325-BhavyaJaggi.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/bhavya-jaggi-20b768284", github: "https://github.com/BhavyaJaggi12", instagram: "https://www.instagram.com/bhav.ya_jaggi" },
    { name: "Neil Gupta", role: "Technical Secretary", image: "https://images.prismic.io/ieeemuj/aENAUbh8WN-LVx31_IMG_2745-NeilGupta.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/neil-gupta-97a0242a1", github: "", instagram: "https://www.instagram.com/neilguptaa._" },
  ];

  const CORE_MEMBERS = [
    { name: "Aarush Dayal", role: "Head of Programs", image: "https://images.prismic.io/ieeemuj/aD2-Irh8WN-LVfO7_aarushdayal-ieeeweb-img-AarushDayal.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/aarush-dayal-790812215/", github: "", instagram: "https://instagram.com/aarushdayal" },
    { name: "Tejas Bhadauria", role: "Joint Head of Programs", image: "https://images.prismic.io/ieeemuj/aD2-_rh8WN-LVfP9_cropped-image-1--CrystalFire.png?auto=format,compress", linkedin: "https://www.linkedin.com/in/tejas-bhadauria-513a78293", github: "https://github.com/CrystalFire1o8", instagram: "https://instagram.com/tejasbhadauriaa" },
    { name: "Devang Sabarwal", role: "Senior Coordinator of Programs", image: "https://images.prismic.io/ieeemuj/aD2_s7h8WN-LVfQp_IMG_8475_Original-Devang.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/devang-sabbarwal-397563249", github: "", instagram: "https://instagram.com/d4vang" },
    { name: "Saksham Jain", role: "Senior Coordinator of Programs", image: "https://images.prismic.io/ieeemuj/aD2__bh8WN-LVfRL_Image-SakshamJain.jpg?auto=format,compress", linkedin: "http://www.linkedin.com/in/saksham-jain-x7", github: "", instagram: "https://instagram.com/_.saksham_jain" },
    { name: "Kavya Sharma", role: "Senior Coordinator of Programs", image: "https://images.prismic.io/ieeemuj/aD3AI7h8WN-LVfRa_1000077001-1--KavyaSharma.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/kavya-sharma-479839335", github: "", instagram: "https://instagram.com/kavyaaa_9735" },
    { name: "Arnav Pawar", role: "Senior Coordinator of Programs", image: "https://images.prismic.io/ieeemuj/aD3ASbh8WN-LVfRg_ArnavPawar-ArnavPawar.jpg?auto=format,compress", linkedin: "https://linkedin.com/in/arnav-pawar-080867349/", github: "", instagram: "https://instagram.com/arnav_pawarrr" },
    { name: "Aradhya Bansal", role: "Senior Coordinator of Programs", image: "https://images.prismic.io/ieeemuj/aD3Avbh8WN-LVfSG_ProfilePic-AradhyaBansal.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/aradhyabansal2407", github: "", instagram: "https://instagram.com/aradhyabansal_24" },
    { name: "Sanidhya Jaiswal", role: "Senior Coordinator of Programs", image: "https://images.prismic.io/ieeemuj/aEM3hbh8WN-LVxrj_WhatsAppImage2025-06-05at14.39.33_3699181e.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/sanidhya-jaiswal-033378325/", github: "https://github.com/Sanidhya-Jaiswal", instagram: "https://instagram.com/saaaniiee" },
    { name: "Tamanna Malhotra", role: "Senior Coordinator of Programs", image: "https://images.prismic.io/ieeemuj/aD3BY7h8WN-LVfS9_InShot_20250528_192147924-TamannaMalhotra.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/tamannamalhotra24", github: "", instagram: "https://instagram.com/tamannamalhotra24" },
    { name: "Hemank Kumar", role: "Head of Technical Projects", image: "https://images.prismic.io/ieeemuj/aD3B_Lh8WN-LVfTR_pong-arty.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/hemankkumar24/", github: "https://github.com/artyish", instagram: "https://instagram.com/hemankfr" },
    { name: "Disha Chopra", role: "Joint Head of Technical Projects", image: "https://images.prismic.io/ieeemuj/aD3CJbh8WN-LVfTa_cropped-image-2--Disha.png?auto=format,compress", linkedin: "https://www.linkedin.com/in/disha-chopra-116244339", github: "", instagram: "https://instagram.com/_disha1210" },
    { name: "Tanmoy Mandal", role: "Senior Coordinator of Technical Projects", image: "https://images.prismic.io/ieeemuj/aD3EmLh8WN-LVfVO_photo-Tanmay.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/tanmoy-mandal-014a23326/", github: "https://github.com/Tanmayman0896", instagram: "https://instagram.com/notanmay._" },
    { name: "Shubh Somani", role: "Senior Coordinator of Technical Projects", image: "https://images.prismic.io/ieeemuj/aD3DELh8WN-LVfUO_DA96186B-1752-4663-85A2-0A869CB9A5DC-ShubhSomani.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/shubh-somani-aa4a49284", github: "https://github.com/ShubhxYT", instagram: "https://instagram.com/shubhsomani" },
    { name: "Siddharth Meena", role: "Senior Coordinator of Technical Projects", image: "https://images.prismic.io/ieeemuj/aD3Dkbh8WN-LVfUm_1000093770-1--Siddarth.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/siddharth--meena", github: "https://github.com/SiddDevZ", instagram: "https://instagram.com/siddharthmz" },
    { name: "Saksham Tyagi", role: "Senior Coordinator of Technical Projects", image: "https://images.prismic.io/ieeemuj/aD3D-7h8WN-LVfUw_IMG_20250527_151837-SakshamTyagi.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/saksham-tyagi-369109288", github: "https://github.com/SakshamTyagi17", instagram: "https://instagram.com/tyagi_saksham_01" },
    { name: "Ayush Ranjan", role: "Senior Coordinator of Technical Projects", image: "https://images.prismic.io/ieeemuj/aD3EIrh8WN-LVfU3_Ayush_Ranjan-AyushRanjan.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/ayush-ranjan-muj-cse/", github: "https://github.com/Ayush007-pro", instagram: "https://www.instagram.com/ayush_ranjan5429/" },
    { name: "Kushagra Kaushik", role: "Senior Coordinator of Technical Projects", image: "https://images.prismic.io/ieeemuj/aEM2dLh8WN-LVxqH_WhatsAppImage2025-06-05at01.47.53_da5b4988.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/kushagrakaushik19", github: "", instagram: "https://instagram.com/_uncaged._" },
    { name: "Abishri V K", role: "Senior Coordinator of Technical Projects", image: "https://images.prismic.io/ieeemuj/aD3Harh8WN-LVfW4_20250528_143558-AbishriVK.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/abishri-v-k-199bb6333", github: "", instagram: "https://instagram.com/abishrii_kumar" },
    { name: "Anushka Singh", role: "Senior Coordinator of Technical Projects", image: "https://images.prismic.io/ieeemuj/aD3Hprh8WN-LVfXD_IMG-20250528-WA0013-Anushka.jpg?auto=format,compress", linkedin: "https://in.linkedin.com/in/anushka-singh-413098294", github: "https://github.com/anushkasinghxx", instagram: "https://instagram.com/nush.singh05" },
    { name: "Abhijay Shrivastava", role: "Head of Graphic Design", image: "https://images.prismic.io/ieeemuj/aD3IH7h8WN-LVfXW_Screenshot_20250528-131631-Abhijay.png?auto=format,compress", linkedin: "https://www.linkedin.com/in/abhijay-shrivastava", github: "https://github.com/Abhijay0910", instagram: "https://instagram.com/Abhijay_0910" },
    { name: "Arindam Sharmaa", role: "Joint Head of Graphic Design", image: "https://images.prismic.io/ieeemuj/aEM4ILh8WN-LVxsP_IEEE3%5B1%5D.JPG?auto=format,compress", linkedin: "https://www.linkedin.com/in/arindam~sharma~5906", github: "", instagram: "https://instagram.com/arindamsharma05/" },
    { name: "Kartik Garg", role: "Senior Coordinator of Graphic Design", image: "https://images.prismic.io/ieeemuj/aD3QSbh8WN-LVfeY_sqaurephoto-KartikGarg.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/kartikgarg123", github: "https://github.com/Kartik-Garg-13", instagram: "https://instagram.com/kartik_gargg" },
    { name: "Abhinav Singh Negi", role: "Senior Coordinator of Graphic Design", image: "https://images.prismic.io/ieeemuj/aD3Qe7h8WN-LVfep_avi3-1-%5B1%5D-aaravispro12.png?auto=format,compress", linkedin: "https://www.linkedin.com/in/abhinav-singh-negi-28360a32a/", github: "https://github.com/AbhinvSinghNegi", instagram: "" },
    { name: "Arjun Khanna", role: "Senior Coordinator of Graphic Design", image: "https://images.prismic.io/ieeemuj/aD3Qubh8WN-LVfey_IMG_1473-arjunkhanna.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/arjun-khanna8", github: "", instagram: "https://instagram.com/arjunnnkhanna" },
    { name: "Aabha Rajpal", role: "Head of Promotions", image: "https://images.prismic.io/ieeemuj/aD3Q_7h8WN-LVfe7_Aabha_Rajpal-AabhaRajpal.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/aabha-rajpal-630b41300", github: "", instagram: "https://instagram.com/aabharajpal777" },
    { name: "Shreyas Kumar Singh", role: "Joint Head of Promotions", image: "https://images.prismic.io/ieeemuj/aD3RPbh8WN-LVffH_shreyaskrs-ShreyasKumarSingh.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/shreyaskrs/", github: "https://github.com/shreyyaz", instagram: "https://instagram.com/shreyyaz" },
    { name: "Samaira Agarwal", role: "Senior Coordinator of Promotions", image: "https://images.prismic.io/ieeemuj/aD3RZrh8WN-LVffJ_IEEEpicture-SamairaAgarwal.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/samaira-agarwal-3608b2247/", github: "", instagram: "https://instagram.com/samaira_201206" },
    { name: "Dev Kumar Raikwar", role: "Senior Coordinator of Promotions", image: "https://images.prismic.io/ieeemuj/aD3Rjbh8WN-LVffL_94a7460e-ff3c-42fc-b6d1-603d1469d725-DevRaikwar.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/dev-kumar-raikwar-x7/", github: "", instagram: "" },
    { name: "Aarav Shah", role: "Senior Coordinator of Promotions", image: "https://images.prismic.io/ieeemuj/aD3RwLh8WN-LVffS_aaravshahIeee-AaravShah.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/aarav-shah-741983349/", github: "", instagram: "https://instagram.com/aaravshah_1017" },
    { name: "Rashmi Singh", role: "Senior Coordinator of Promotions", image: "https://images.prismic.io/ieeemuj/aD3SC7h8WN-LVffa_IMG_20250528_124026-RashmiSingh.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/rashmi-singh-6a743234a", github: "", instagram: "https://instagram.com/_.khayalipulao" },
    { name: "Sahanaa Vashishth", role: "Senior Coordinator of Promotions", image: "https://images.prismic.io/ieeemuj/aD3SLrh8WN-LVffg_sana.2-sahanaav.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/sahanaa-vashishth-ba32a4332", github: "", instagram: "https://instagram.com/itzsahanaa" },
    { name: "Amiya Sharma", role: "Senior Coordinator of Promotions", image: "https://images.prismic.io/ieeemuj/aD3Xubh8WN-LVfhz_IMG_3863-AmiyaSharma.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/amiya-sharma-75490933a", github: "", instagram: "https://instagram.com/amiya_sharma13" },
    { name: "Sara Pansuriya", role: "Head of Editorial", image: "https://images.prismic.io/ieeemuj/aD3YAbh8WN-LVfh5_IMG_0013_1_1080x1080-SaraPansuriya.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/sara-pansuriya-936299338", github: "", instagram: "https://instagram.com/sarapansuriya" },
    { name: "Shreya Daljeet", role: "Joint Head of Editorial", image: "https://images.prismic.io/ieeemuj/aD3Yebh8WN-LVfh7_IMG_7571-shreya.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/shreya-daljeet-4b7195231", github: "", instagram: "https://instagram.com/shrxyeet" },
    { name: "Brinda Kashyap", role: "Senior Coordinator of Editorial", image: "https://images.prismic.io/ieeemuj/aD3YtLh8WN-LVfh__IMG_20250528_132203-BrindaKashyap.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/brinda-kashyap-b16933331/", github: "", instagram: "" },
    { name: "Divyanshi", role: "Senior Coordinator of Editorial", image: "https://images.prismic.io/ieeemuj/aD_14rh8WN-LVkcP_IMG-20250527-WA0002-RaseshwariMishra.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/divyanshi-gusainwal-5b6b70350", github: "", instagram: "https://instagram.com/this_is_divyanshi___" },
    { name: "Bhavika Yadav", role: "Senior Coordinator of Editorial", image: "https://images.prismic.io/ieeemuj/aD3aTrh8WN-LVfi3_IMG_1301-BhavikaYadav.jpeg?auto=format,compress", linkedin: "http://linkedin.com/in/bhavika-yadav-7b4b3a333", github: "", instagram: "https://instagram.com/bhavi_karao12" },
    { name: "Dolly Srivastava", role: "Head of Corporate Affairs", image: "https://images.prismic.io/ieeemuj/aD3a2rh8WN-LVfjA_wowkyaphotohai-DollySrivastava.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/dollysrivastava", github: "https://github.com/idkdolly", instagram: "https://instagram.com/dollysrivastava14" },
    { name: "Charu Malik", role: "Joint Head of Corporate Affairs", image: "https://images.prismic.io/ieeemuj/aD3bG7h8WN-LVfjD_IMG_20250528_111333-CharuMalik.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/charu-malik-56636733a", github: "", instagram: "https://instagram.com/_charuuuu._" },
    { name: "Disha Khemka", role: "Senior Coordinator of Corporate Affairs", image: "https://images.prismic.io/ieeemuj/aD3bYbh8WN-LVfjL_ycl34430-DISHAKHEMKA.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/disha-khemka-868b3a35b/", github: "https://github.com/Disha-Khemka", instagram: "https://instagram.com/dishaa_khemka" },
    { name: "Saharsh Vaibhav Lal", role: "Senior Coordinator of Corporate Affairs", image: "https://images.prismic.io/ieeemuj/aD3eK7h8WN-LVfkw_IMG-20250527-WA0019_edited-2023AABAAD.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/saharsh-vaibhav-lal-65061b317/", github: "", instagram: "https://instagram.com/saharsh_1_1_0_7" },
    { name: "Ayush Tanwar", role: "Head of Curations", image: "https://images.prismic.io/ieeemuj/aD_ue7h8WN-LVkY0_IMG_20250109_032258763~2-AyushTanwar.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/ayush-tanwar-x7/", github: "", instagram: "https://www.instagram.com/ayushtanwar_07/" },
    { name: "Mehul Manohar Shah", role: "Joint Head of Curations", image: "https://images.prismic.io/ieeemuj/aD_uubh8WN-LVkY6_IMG_6490-MehulManoharSah.JPG?auto=format,compress", linkedin: "https://www.linkedin.com/in/mehul-manohar-sah-087a3835b", github: "", instagram: "https://instagram.com/mehul_manohar_sah" },
    { name: "Samarth Majumbdar", role: "Senior Coordinator of Curations", image: "https://images.prismic.io/ieeemuj/aD_u3Lh8WN-LVkY9_Samarth-SamarthMujumdar.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/samarth-mujumdar-680468332", github: "https://github.com/SamarthMujumdar", instagram: "https://instagram.com/mujumdar_samarth" },
    { name: "Aditya Chauhan", role: "Senior Coordinator of Curations", image: "https://images.prismic.io/ieeemuj/aEM2xLh8WN-LVxqf_WhatsAppImage2025-06-06at14.29.29_170f729b.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/adityaaachauhannn", github: "https://github.com/adityaaachauhannn", instagram: "https://instagram.com/adityaa.c_" },
    { name: "Harshita Agarwal", role: "Senior Coordinator of Curations", image: "https://images.prismic.io/ieeemuj/aD_vQbh8WN-LVkZG_IMG_5088-Harshitaagarwal.JPG?auto=format,compress", linkedin: "https://www.linkedin.com/in/harshita-agarwal-a0578834b/", github: "https://github.com/harshita0102", instagram: "https://instagram.com/harshita.0102" },
    { name: "Utkarsh Saxena", role: "Head of Logistics", image: "https://images.prismic.io/ieeemuj/aD_veLh8WN-LVkZL_myphotoforieeewebsiteandinstapage-Utkarshsaxena.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/utkarsh-saxena-193163349/", github: "", instagram: "https://instagram.com/utkarsh_saxena.17" },
    { name: "Keshav Anand", role: "Joint Head of Logistics", image: "https://images.prismic.io/ieeemuj/aD_vnLh8WN-LVkZP_96ad7182-9dd4-46bc-8a16-9f3a61cb9b04-KeshavAnand.jpeg?auto=format,compress", linkedin: "http://linkedin.com/in/keshav-anand-479712327", github: "", instagram: "https://instagram.com/keshav_anand_21" },
    { name: "Samriddh Dwivedi", role: "Head of Media", image: "https://images.prismic.io/ieeemuj/aD_v3bh8WN-LVkZV_IMG_20250529_185415-SamriddhDwivedi.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/samriddhdwivedi/", github: "", instagram: "https://www.instagram.com/samriddhdwivedi/" },
    { name: "Drishti Verma", role: "Head of Social Media", image: "https://images.prismic.io/ieeemuj/aD_wC7h8WN-LVkZb_IMG-20250330-WA0347~2-drishtiverma.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/drishti-verma-240b2b302", github: "", instagram: "https://instagram.com/drishtivermav7" },
    { name: "Arush Pradhan", role: "Joint Head of Social Media", image: "https://images.prismic.io/ieeemuj/aD3ByLh8WN-LVfTL_IMG-20250527-WA0009-ArushPradhan.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/arush-pradhan-b2023b316", github: "", instagram: "https://instagram.com/cool_crusaderr" },
    { name: "Arunika Jain", role: "Senior Coordinator of Social Media", image: "https://images.prismic.io/ieeemuj/aD_wW7h8WN-LVkZn_IMG_6900-ArunikaJain.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/arunika-jain22", github: "", instagram: "https://instagram.com/aruunikaaaaa" },
    { name: "Ishika Taneja", role: "Senior Coordinator of Social Media", image: "https://images.prismic.io/ieeemuj/aD_xH7h8WN-LVkZ7_4fb3d037-8257-4691-97c1-2d300677d0d8-IshikaTaneja.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/ishika-taneja", github: "", instagram: "https://instagram.com/_ishika_taneja" },
    { name: "Janvi Singh", role: "Senior Coordinator of Social Media", image: "https://images.prismic.io/ieeemuj/aD_xeLh8WN-LVkaA_ZeeResizer-JanviSingh.png?auto=format,compress", linkedin: "https://www.linkedin.com/in/janvi-singh-55b680303", github: "", instagram: "https://instagram.com/_janvi.singhh" },
    { name: "Anushka Kalaskar", role: "Senior Coordinator of Social Media", image: "https://images.prismic.io/ieeemuj/aD_xrrh8WN-LVkaI_IMG-20250528-WA0003-AnushkaKalaskar.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/anushka-kalaskar-714933327", github: "", instagram: "https://instagram.com/anushka.eh" },
    { name: "Treshaa Pathak", role: "Senior Coordinator of Social Media", image: "https://images.prismic.io/ieeemuj/aD_xy7h8WN-LVkaW_91971a82-9c1e-491e-80f6-db251cf5fe9c-TreshaaPathak.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/treshaa-pathak", github: "https://github.com/dontcuttrees", instagram: "https://instagram.com/_.treshaa._" },
    { name: "Sindhuja Dubey", role: "Head of Coverage", image: "https://images.prismic.io/ieeemuj/aD_x_7h8WN-LVkaf_c3134d90-11c9-45a8-91b9-80bcf7f88aa5-sindoooja.jpeg?auto=format,compress", linkedin: "http://linkedin.com/in/sindhuja-d-b368a7256", github: "", instagram: "https://instagram.com/sindhuja.dubeyy" },
    { name: "Vaishak Yadav", role: "Joint Head of Coverage", image: "https://images.prismic.io/ieeemuj/aD_yKLh8WN-LVkaj_IMG_4762-VaishakYadav.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/vaishak-yadav-234481324", github: "", instagram: "https://instagram.com/vaishakkkkk" },
    { name: "Harshvardhan Pathak", role: "Senior Coordinator of Coverage", image: "https://images.prismic.io/ieeemuj/aD_yYrh8WN-LVkat_IMG_20250528_153136_796-HarshPat.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/harsh-pathak-v14", github: "", instagram: "https://instagram.com/Harsh.bhp" },
    { name: "Rakshit Dubey", role: "Head of Community", image: "https://images.prismic.io/ieeemuj/aD_yoLh8WN-LVkay_IMG_0821-RakshitDubey.jpeg?auto=format,compress", linkedin: "https://www.linkedin.com/in/rakshit-dubey-b9b799283", github: "", instagram: "https://instagram.com/rakkk_21" },
    { name: "Rahul Durgapal", role: "Joint Head of Community", image: "https://images.prismic.io/ieeemuj/aD_y37h8WN-LVka4_pic-RahulDurgapal.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/rahuldurgapal555", github: "https://github.com/techie-rahul", instagram: "https://instagram.com/__rahul.555_" },
    { name: "Sanskar Gupta", role: "Senior Coordinator of Community", image: "https://images.prismic.io/ieeemuj/aD_zBLh8WN-LVka-_Sanskar_Gupta_Senior_Photo-SanskarGupta.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/sanskargupta2709/", github: "", instagram: "https://instagram.com/sanskargupta2709" },
    { name: "Anshuman Singh", role: "Senior Coordinator of Community", image: "https://images.prismic.io/ieeemuj/aEM3B7h8WN-LVxqu_20250405_211338-AnshumanSingh.jpg?auto=format,compress", linkedin: "https://www.linkedin.com/in/anshuman-singh-766088368/", github: "", instagram: "https://instagram.com/anshuman.singh070" },
    { name: "Aarush Chandra", role: "Senior Coordinator of Community", image: "https://images.prismic.io/ieeemuj/aD_zbLh8WN-LVkbL_What_Image_3e47uu3e47uu3e47-AarushChandra.png?auto=format,compress", linkedin: "https://www.linkedin.com/in/aarush-chandra-4r724", github: "", instagram: "https://instagram.com/weird_kid_07" },
  ];

  const WEB_MEMBERS = [
    { name: "Ananya Gupta", role: "Frontend Lead", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&q=80", linkedin: "#", instagram: "#", github: "" },
    { name: "Dev Malhotra", role: "Backend Lead", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&q=80", linkedin: "#", instagram: "#", github: "" },
    { name: "Ishika Sethi", role: "UI/UX Designer", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&q=80", linkedin: "#", instagram: "#", github: "" },
    { name: "Nikhil Bose", role: "DevOps", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&q=80", linkedin: "#", instagram: "#", github: "" },
  ];

  const toRow = (m: { name: string; role: string; image: string; linkedin?: string; github?: string; instagram?: string }, group: string, order: number) => ({
    name: m.name.trim(),
    role: m.role.trim(),
    imageUrl: m.image,
    group,
    linkedinUrl: m.linkedin && m.linkedin !== '#' && m.linkedin !== '' ? m.linkedin : null,
    instagramUrl: m.instagram && m.instagram !== '#' && m.instagram !== '' ? m.instagram : null,
    githubUrl: m.github && m.github !== '#' && m.github !== '' ? m.github : null,
    displayOrder: order,
    isActive: true,
  });

  const rows = [
    ...EC_MEMBERS.map((m, i) => toRow(m, 'ec', i)),
    ...CORE_MEMBERS.map((m, i) => toRow(m, 'core', i)),
    ...WEB_MEMBERS.map((m, i) => toRow(m, 'web', i)),
  ];

  console.log(`📋 Inserting ${rows.length} team members...`);

  // Insert in batches of 20 to avoid query size limits
  for (let i = 0; i < rows.length; i += 20) {
    const batch = rows.slice(i, i + 20);
    await db.insert(teamMembers).values(batch).onConflictDoNothing();
    console.log(`  ✓ Batch ${Math.floor(i / 20) + 1}: inserted ${batch.length} members`);
  }

  console.log(`✅ Team seeding complete! ${rows.length} members inserted.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Team seeding failed:', err);
  process.exit(1);
});
