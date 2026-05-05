"use client";

import useBreakpoints from "@/hooks/useBreakpoints";
import { Accordion, AccordionItem, Link } from "@heroui/react";

const FAQS = [
  {
    title: "🤔 Suutamanime là gì?",
    description:
      "Suutamanime là trang web xem phim và chương trình TV miễn phí, giúp bạn dễ dàng truy cập tất cả các bộ phim và series yêu thích mà không cần mất hàng giờ tìm kiếm.",
  },
  {
    title: "❓ Chúng tôi làm gì?",
    description:
      "Chúng tôi không lưu trữ bất kỳ nội dung nào có bản quyền trên máy chủ của mình. Tất cả các liên kết video đều được lưu trữ trên các trang web bên thứ ba. Đây là trang web giới thiệu. Chúng tôi khuyến khích người dùng mua DVD hoặc đăng ký các dịch vụ streaming hợp pháp để ủng hộ nhà sản xuất.",
  },
  {
    title: "🚫 Tôi không xem được video vì quảng cáo",
    description: (
      <p>
        Chúng tôi rất tiếc vì không thể kiểm soát các quảng cáo xuất hiện. Đừng tải bất kỳ thứ gì
        từ các popup. Nếu bạn không muốn bị làm phiền, hãy sử dụng tiện ích chặn quảng cáo như{" "}
        <Link href="https://ublockorigin.com/" target="_blank" className="font-bold">
          uBlock Origin
        </Link>{" "}
        hoặc{" "}
        <Link href="https://adblockplus.org/" target="_blank" className="font-bold">
          Adblock Plus
        </Link>
        .
      </p>
    ),
  },
  {
    title: "🐌 Video phát chậm hoặc không phát được",
    description:
      "Khi vào trang xem phim, hãy nhấn nút Play. Nếu không hoạt động, hãy thử chuyển sang server khác bằng cách nhấn vào các tùy chọn server ở góc trên bên phải. Mỗi server có tốc độ khác nhau, hãy thử lần lượt để tìm server phù hợp nhất với kết nối của bạn.",
  },
  {
    title: "😁 Tôi muốn tải video về",
    description:
      "Vì chúng tôi không lưu trữ bất kỳ tệp nào trên máy chủ, nên chúng tôi không có tính năng tải xuống. Tất cả các video đều được liên kết từ các nguồn bên thứ ba.",
  },
  {
    title: "😟 Trang web này có an toàn không?",
    description:
      "Trang web này hoàn toàn an toàn để xem phim trực tuyến. Bạn sẽ không gặp bất kỳ rắc rối nào khi sử dụng trang web của chúng tôi. Tuy nhiên, việc tải xuống và chia sẻ nội dung có bản quyền là vi phạm pháp luật và không được khuyến khích.",
  },
];

const FAQ = () => {
  const { mobile } = useBreakpoints();

  return (
    <Accordion variant="splitted" isCompact={mobile}>
      {FAQS.map(({ title, description }) => (
        <AccordionItem key={title} aria-label={title} title={title}>
          {description}
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQ;