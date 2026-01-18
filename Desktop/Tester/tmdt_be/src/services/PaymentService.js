// services/PaymentService.js
import crypto from "crypto";

const VNP_URL = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNP_TMN_CODE = process.env.VNP_TMN_CODE; // ví dụ: "BOTU0PS8"
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET; // secret sandbox
const VNP_RETURN_URL = process.env.VNP_RETURN_URL; // http://localhost:3000/api/payments/vnpay/return
const VNP_ORDER_TYPE = process.env.VNP_ORDER_TYPE || "other"; // nhiều cổng yêu cầu bắt buộc

// Encode theo application/x-www-form-urlencoded (space -> '+'), sắp xếp key theo thứ tự a-z
function formUrlEncodeSorted(obj) {
    const keys = Object.keys(obj).sort();
    return keys
        .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(obj[k])).replace(/%20/g, "+")}`)
        .join("&");
}

function hmac512Upper(str, secret) {
    return crypto.createHmac("sha512", secret).update(str, "utf8").digest("hex").toUpperCase();
}

function formatVnpDate(d = new Date()) {
    // YYYYMMDDHHmmss theo local time (tránh lệch múi giờ khi sandbox kiểm tra)
    const pad = (n) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hour = pad(d.getHours());
    const min = pad(d.getMinutes());
    const sec = pad(d.getSeconds());
    return `${year}${month}${day}${hour}${min}${sec}`;
}

const PaymentService = {
    buildPaymentUrl({ amount, orderId, ipAddr = "127.0.0.1", orderInfo = "", locale = "vn", returnUrl = VNP_RETURN_URL }) {
        if (!VNP_TMN_CODE || !VNP_HASH_SECRET) throw new Error("Missing VNP config");
        if (!returnUrl) throw new Error("Missing VNP_RETURN_URL");

        // TxnRef: duy nhất và chỉ ký tự số theo yêu cầu VNPAY (tránh ký tự đặc biệt)
        // Sử dụng id đơn hàng làm vnp_TxnRef để đối chiếu dễ dàng ở return/IPN
        const txnRef = String(parseInt(orderId));

        const vnp = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: VNP_TMN_CODE,
            vnp_Amount: Math.round(Number(amount) * 100), // nhân 100 và là số nguyên
            vnp_CurrCode: "VND",
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: orderInfo || `Order ${orderId}`,
            vnp_Locale: locale || "vn",
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddr || "127.0.0.1",
            vnp_CreateDate: formatVnpDate(),
            vnp_OrderType: VNP_ORDER_TYPE, // phần lớn merchant yêu cầu có trường này
            // vnp_BankCode: "VNBANK", // optional
        };

        const encodedQuery = formUrlEncodeSorted(vnp);
        const vnp_SecureHash = hmac512Upper(encodedQuery, VNP_HASH_SECRET);

        const paymentUrl = `${VNP_URL}?${encodedQuery}&vnp_SecureHash=${vnp_SecureHash}&vnp_SecureHashType=HmacSHA512`;

        console.log("[VNPAY] signData=", encodedQuery);
        console.log("[VNPAY] paymentUrl=", paymentUrl);

        return paymentUrl;
    },

    verifySignature(allParams) {
        const params = { ...allParams };
        const secureHash = String(params.vnp_SecureHash || "").toUpperCase();
        delete params.vnp_SecureHash;
        delete params.vnp_SecureHashType;

        const encodedQuery = formUrlEncodeSorted(params);
        const myHash = hmac512Upper(encodedQuery, VNP_HASH_SECRET);

        return myHash === secureHash;
    },
};

export default PaymentService;
