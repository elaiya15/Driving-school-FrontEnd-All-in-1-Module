import {extractDriveFileId,} from './funtion.js'
// const backEndUrl=import.meta.env.VITE_API_URL;
const backEndUrl=import.meta.env.VITE_BACK_URL; 

const DriveImage = () => {
 
  const data =  {
            "photo": "https://drive.google.com/file/d/1DXJyZVGMc7lOk2mEJ5crdOHfLJ89kVH4/view?usp=drivesdk",
            "signature": "https://drive.google.com/file/d/1r7EAIGQJiK3VL0DkudTy3hAbRtmMhCqm/view?usp=drivesdk",
            "aadharCard": "https://drive.google.com/file/d/1UjBUVksyOO__euuSQciBMvYGAR33Y0c8/view?usp=drivesdk",
            "educationCertificate": "https://drive.google.com/file/d/1OYD9L-sK7TkRsaLk1YvKyK_xzLKOtLzF/view?usp=drivesdk",
            "passport": "https://drive.google.com/file/d/1muPGW8w1oWWISp1qSPvXhiQ4Vk5-BqCo/view?usp=drivesdk",
            "notary": "https://drive.google.com/file/d/1mndvo9Tc40ZDKbCb6YUmP8D_VsvEwyMB/view?usp=drivesdk",
  }

  return (
<> 


<img
  src={`${backEndUrl}/api/image-proxy/${extractDriveFileId(data.photo)}`}
  alt="Drive Image"
/>
<img
  src={`${backEndUrl}/api/image-proxy/${extractDriveFileId(data.signature)}`}
  alt="Drive Image"
/>
<img
  src={`${backEndUrl}/api/image-proxy/${extractDriveFileId(data.aadharCard)}`}
  alt="Drive Image"
/>

</>

  );
};

export default DriveImage;
