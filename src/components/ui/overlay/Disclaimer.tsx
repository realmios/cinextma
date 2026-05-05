"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { useDisclosure, useInterval, useLocalStorage } from "@mantine/hooks";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ScrollShadow,
} from "@heroui/react";
import { DISCLAIMER_STORAGE_KEY, IS_BROWSER } from "@/utils/constants";
import { cn } from "@/utils/helpers";

const COUNTDOWN_DURATION = 10;
const MODAL_SIZE = "3xl";
const DISCLAIMER_CONTENT = {
  title: "Chào mừng đến với Suutamanime! 🎬",
  paragraphs: [
    {
      id: "welcome",
      content:
        "Suutamanime là trang web xem phim cá nhân của Hải — được tạo ra để sưu tầm và chia sẻ những bộ anime, phim và TV show yêu thích. Chúc mọi người xem phim vui vẻ! 🍿",
    },
    {
      id: "purpose",
      content: "Đây là dự án cá nhân phi lợi nhuận,",
      emphasis: "không nhằm mục đích thương mại.",
      continuation:
        "Toàn bộ nội dung được sưu tầm từ các nguồn có sẵn trên internet và chỉ phục vụ mục đích giải trí cá nhân.",
    },
    {
      id: "content-source",
      content:
        "Thông tin phim (poster, mô tả, đánh giá...) được lấy từ",
      emphasis: "The Movie Database (TMDB).",
      continuation:
        "Trang web không lưu trữ hay phân phối bất kỳ file media nào trên máy chủ của mình.",
    },
    {
      id: "responsibility",
      content:
        "Bằng cách sử dụng Suutamanime, bạn đồng ý rằng mọi nội dung chỉ dành cho mục đích xem cá nhân. Nếu có bất kỳ vấn đề nào về bản quyền, vui lòng liên hệ để được xử lý kịp thời.",
    },
    {
      id: "usage",
      content:
        "Chúc bạn có những giờ phút giải trí thật vui vẻ và thoải mái cùng Suutamanime! Mọi phản hồi và góp ý đều được chào đón. Cảm ơn bạn đã ghé thăm! ❤️",
    },
  ],
};

interface DisclaimerParagraphProps {
  content: string;
  emphasis?: string;
  continuation?: string;
}

const DisclaimerParagraph: React.FC<DisclaimerParagraphProps> = memo(
  ({ content, emphasis, continuation }) => (
    <p>
      {content}
      {emphasis && (
        <>
          {" "}
          <strong>{emphasis}</strong>
        </>
      )}
      {continuation && ` ${continuation}`}
    </p>
  ),
);

DisclaimerParagraph.displayName = "DisclaimerParagraph";

const Disclaimer: React.FC = () => {
  const [hasAgreed, setHasAgreed] = useLocalStorage<boolean>({
    key: DISCLAIMER_STORAGE_KEY,
    defaultValue: false,
    getInitialValueInEffect: false,
  });

  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_DURATION);

  const shouldShowModal = useMemo(() => !hasAgreed && IS_BROWSER, [hasAgreed]);

  const [isOpen, { close }] = useDisclosure(shouldShowModal);

  useInterval(() => setSecondsRemaining((prev) => Math.max(0, prev - 1)), 1000, {
    autoInvoke: shouldShowModal && secondsRemaining > 0,
  });

  const isButtonDisabled = secondsRemaining > 0;
  const buttonText = useMemo(
    () => `Đồng ý${isButtonDisabled ? ` (${secondsRemaining})` : ""}`,
    [isButtonDisabled, secondsRemaining],
  );

  const handleAgree = useCallback(() => {
    close();
    setHasAgreed(true);
  }, [close, setHasAgreed]);

  if (hasAgreed || !IS_BROWSER) {
    return null;
  }

  return (
    <Modal
      hideCloseButton
      isOpen={isOpen}
      placement="center"
      backdrop="blur"
      size={MODAL_SIZE}
      isDismissable={false}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center text-2xl">
          {DISCLAIMER_CONTENT.title}
        </ModalHeader>

        <ModalBody>
          <ScrollShadow hideScrollBar className="space-y-4">
            {DISCLAIMER_CONTENT.paragraphs.map((paragraph) => (
              <DisclaimerParagraph
                key={paragraph.id}
                content={paragraph.content}
                emphasis={paragraph.emphasis}
                continuation={paragraph.continuation}
              />
            ))}
          </ScrollShadow>
        </ModalBody>

        <ModalFooter className="justify-center">
          <Button
            className={cn(isButtonDisabled && "pointer-events-auto cursor-not-allowed")}
            isDisabled={isButtonDisabled}
            color={isButtonDisabled ? "danger" : "primary"}
            variant="shadow"
            onPress={handleAgree}
          >
            {buttonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Disclaimer;