# @saas-factory/factory-hmac

工廠後台與生成出來的客戶站之間的內部 `bootstrap-admin` HMAC 簽章與驗章。

簽章基底為 `METHOD\nPATH\nTIMESTAMP\nBODY`，採 base64url 編碼；驗章用 `timingSafeEqual`；
預設時間漂移 5 分鐘。
