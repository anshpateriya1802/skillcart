import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import React from "react";
import { CertificateTemplate } from "../components/ui/CertificateTemplate";

export const downloadCertificate = async ({
  userName,
  courseTitle,
  completionDate,
  certificateId,
  instructorName,
}) => {
  const WIDTH = 1600;
  const HEIGHT = 1000;

  // Temp container
  const temp = document.createElement("div");
  temp.style.position = "fixed";
  temp.style.top = "0";
  temp.style.left = "0";
  temp.style.width = `${WIDTH}px`;
  temp.style.height = `${HEIGHT}px`;
  temp.style.background = "#ffffff";
  temp.style.opacity = "0";
  temp.style.pointerEvents = "none";
  temp.style.margin = "0";
  temp.style.padding = "0";
  temp.style.overflow = "hidden";
  document.body.appendChild(temp);

  const rootEl = document.createElement("div");
  rootEl.style.width = "100%";
  rootEl.style.height = "100%";
  temp.appendChild(rootEl);

  const root = createRoot(rootEl);

  root.render(
    React.createElement(CertificateTemplate, {
      userName,
      courseTitle,
      completionDate,
      certificateId,
      instructorName,
    })
  );

  // Wait for render + fonts
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));
  if (document.fonts?.ready) await document.fonts.ready;

  // Capture
  const canvas = await html2canvas(rootEl, {
    scale: 3,
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: "#ffffff",
    useCORS: true,
    removeContainer: true,
  });

  root.unmount();
  document.body.removeChild(temp);

  // PDF (exact size)
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [WIDTH, HEIGHT],
  });

  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, WIDTH, HEIGHT);

  const fileName = `skillcert_${userName
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()}_${courseTitle
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()}.pdf`;

  pdf.save(fileName);
};
