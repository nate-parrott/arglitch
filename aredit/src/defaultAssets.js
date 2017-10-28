let defaultAssets = {
  "materials" : {
    "-KxZahN-RKgquzvTTxo9" : {
      "smallSrc" : "https://firebasestorage.googleapis.com/v0/b/ar-edit.appspot.com/o/assets%2Ff6253122-373d-4149-b542-0781abe58162?alt=media&token=a3799460-795d-4409-b52f-d6694863972d",
      "src" : "https://firebasestorage.googleapis.com/v0/b/ar-edit.appspot.com/o/assets%2F2f795a9c-cb25-438d-b8a9-b6edb2e49c8b?alt=media&token=7986edb4-e0db-4917-9ce7-2a2ee24ea6c5"
    },
    "-KxZalweDhCmXrU9k3VT" : {
      "smallSrc" : "https://firebasestorage.googleapis.com/v0/b/ar-edit.appspot.com/o/assets%2F60bf7563-99af-47cb-9d8d-e17499953bfb?alt=media&token=914dd331-a41e-49a5-8838-275a2b7c26e0",
      "src" : "https://firebasestorage.googleapis.com/v0/b/ar-edit.appspot.com/o/assets%2Fdd84626b-f1b9-4af2-9fd9-d2c58193962d?alt=media&token=c185501d-8e43-49cf-a5ef-87d6feb8a1d5"
    },
    "-KxZca8rq2pnggFuBY4H" : {
      "smallSrc" : "https://firebasestorage.googleapis.com/v0/b/ar-edit.appspot.com/o/assets%2Fee6648c2-4a41-46f2-9b2b-106ac6b30275?alt=media&token=a76e7fa9-6187-46e9-bf0d-339a893b182a",
      "src" : "https://firebasestorage.googleapis.com/v0/b/ar-edit.appspot.com/o/assets%2Fc57ce5bd-f335-471a-a5b9-8fa83c3669ba?alt=media&token=bcb67586-4c1c-43ca-a230-69a13785d33f"
    },
    "-KxZcwRsBih9qEvKb6KF" : {
      "smallSrc" : "https://firebasestorage.googleapis.com/v0/b/ar-edit.appspot.com/o/assets%2Fbcc6f898-70db-4c24-94bf-28f9c5912eca?alt=media&token=b61ecbbf-8577-424b-899a-657bcc4aece7",
      "src" : "https://firebasestorage.googleapis.com/v0/b/ar-edit.appspot.com/o/assets%2Fe401ffde-fade-4abc-944c-ddef3ea51b5e?alt=media&token=ac9e3737-0ac1-43cc-af16-d6d8cc4b5f15"
    }
  }
};

export let ensureDefaultAssets = (assetsRef) => {
  assetsRef.once('value', (snapshot) => {
    if (!snapshot.val()) {
      assetsRef.set(defaultAssets);
    }
  })
}
