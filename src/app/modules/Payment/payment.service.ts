import axios from "axios";
import prisma from "../../../shared/prisma";
import { PaymentStatus } from "@prisma/client";
import config from "../../../config";
import { SSLService } from "../SSL/ssl.service";

const initPayment = async (appointmentId: string) => {
  const paymentData = await prisma.payment.findFirstOrThrow({
    where: {
      appointmentId,
    },
    include: {
      appointment: {
        include: {
          patient: true,
        },
      },
    },
  });
  // console.log("app data", paymentData);
  const initPaymentData = {
    amount: paymentData.amount,
    transactionId: paymentData.transactionId,
    name: paymentData.appointment.patient.name,
    email: paymentData.appointment.patient.email,
    address: paymentData.appointment.patient.address,
    phoneNumber: paymentData.appointment.patient.contactNumber,
  };
  const result = await SSLService.initPayment(initPaymentData);
  return {
    paymentUrl: result.GatewayPageURL,
  };

  //   console.log("response", response.data);

  // where: {
  //     appointmentId
  // },
  // include: {
  //     appointment: {
  //         include: {
  //             patient: true
  //         }
  //     }
  // }
  //   });

  // const initPaymentData = {
  //     amount: paymentData.amount,
  //     transactionId: paymentData.transactionId,
  //     name: paymentData.appointment.patient.name,
  //     email: paymentData.appointment.patient.email,
  //     address: paymentData.appointment.patient.address,
  //     phoneNumber: paymentData.appointment.patient.contactNumber
  // }

  // const result = await SSLService.initPayment(initPaymentData);
  // return {
  //     paymentUrl: result.GatewayPageURL
  // };
};

const validatePayment = async (payload: any) => {
  // deploy time uncomment
  // if (!payload || !payload.status || !(payload.status === 'VALID')) {
  //     return {
  //         message: "Invalid Payment!"
  //     }
  // }
  // const response = await SSLService.validatePayment(payload);
  // if (response?.status !== 'VALID') {
  //     return {
  //         message: "Payment Failed!"
  //     }
  // }
  // for locally use, and in deploy time comment
  const response = payload;
  await prisma.$transaction(async (tx) => {
    const updatedPaymentData = await tx.payment.update({
      where: {
        transactionId: response.tran_id,
      },
      data: {
        status: PaymentStatus.PAID,
        paymentGatewayData: response,
      },
    });
    await tx.appointment.update({
      where: {
        id: updatedPaymentData.appointmentId,
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
    });
  });
  return {
    message: "Payment success!",
  };
};

export const PaymentService = {
  initPayment,
  validatePayment,
};
