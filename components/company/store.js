import Company from "./model.js";
import { v2 as cloudinary } from 'cloudinary';
import config from "../../config.js";

const removeImage = (urlImage) => {
  if (urlImage) {
    const url = urlImage.split('/');
    const image = url[url.length - 1].split('.');
    cloudinary.uploader
      .destroy(config.cloudinary.FOLDER_NAME + '/' + image[0])
      .then(() => (true))
      .catch(() => (false));
  }
}

export async function getCompany(id) {
  try {
    let query = { active: true };
    if (id) {
      query = { _id: id };
    }

    const result = await Company.findOne(query).populate({
      path: "created.user",
      select: ["name", "lastName"],
      model: "User",
    });
    return {
      status: 200,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> getCompany", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function getCompanys() {
  try {
    let query = { active: true };

    const result = await Company.find(query).populate({
      path: "created.user",
      select: ["name", "lastName"],
      model: "User",
    });
    return {
      status: 200,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> getCompanys", e);
    return {
      status: 400,
      message: "Results error",
      detail: e,
    };
  }
}

export async function addCompany(data, user) {
  try {
    const companyData = {
      name: data.name,
      description: data.description,
      email: data.email,
      phone: data.phone,
      rif: data.rif,
      address: data.address,
      logo: data.logo,
      logoAlpha: data.logoAlpha,
      created: {
        user: user,
      },
    };

    const company = new Company(companyData);
    const result = await company.save();
    return {
      status: 201,
      message: result,
    };
  } catch (e) {
    console.log("[ERROR] -> addCompany", e);
    return {
      status: 400,
      message: "An error occurred while creating the company",
      detail: e,
    };
  }
}

export async function updateCompany(data) {
  try {
    const foundCompany = await Company.findOne({
      _id: data.id,
    });
    if (data.name) {
      foundCompany.name = data.name;
    }
    if (data.description) {
      foundCompany.description = data.description;
    }
    if (data.email) {
      foundCompany.email = data.email;
    }
    if (data.phone) {
      foundCompany.phone = data.phone;
    }
    if (data.rif) {
      foundCompany.rif = data.rif;
    }
    if (data.address) {
      foundCompany.address = data.address;
    }
    if (data.logo) {
      foundCompany.logo = data.logo;
    }
    if (data.logoAlpha) {
      foundCompany.logoAlpha = data.logoAlpha;
    }

    await foundCompany.save();
    return {
      status: 200,
      message: "Company updated successfully",
    };
  } catch (e) {
    console.log("[ERROR] -> updateCompany", e);
    return {
      status: 400,
      message: "An error occurred while updating the company",
      detail: e,
    };
  }
}

export async function configCompany(data, file) {
  try {
    const foundCompany = await Company.findOne({
      _id: data.id,
    });
    if (data.name) {
      foundCompany.name = data.name;
    }
    if (data.email) {
      foundCompany.email = data.iva;
    }
    if (data.iva) {
      foundCompany.iva = data.iva;
    }
    if (data.address) {
      foundCompany.address = data.address;
    }
    if (data.description) {
      foundCompany.description = data.description;
    }
    if (data.phone) {
      foundCompany.phone = data.phone;
    }
    if (data.rif) {
      foundCompany.rif = data.rif;
    }
    if (data.imageType) {
      switch (data.imageType) {
        case 'logo':
          removeImage(foundCompany.logo);
          foundCompany.logo = file.path;
          break;
        case 'logoAlpha':
          removeImage(foundCompany.logoAlpha);
          foundCompany.logoAlpha = file.path;
          break;
        case 'banner':
          removeImage(foundCompany.banner);
          foundCompany.banner = file.path;
          break;
      }
    }
    if (data.currencySymbol) {
      foundCompany.currencySymbol = data.currencySymbol;
    }
    if (data.currencyRate) {
      foundCompany.currencyRate = data.currencyRate;
    }
    if (data.configMail?.colors?.primary) {
      foundCompany.configMail.colors.primary = data.configMail?.colors?.primary;
    }
    if (data.configMail?.colors?.secundary) {
      foundCompany.configMail.colors.secundary = data.configMail?.colors?.secundary;
    }
    if (data.configMail?.colors?.background) {
      foundCompany.configMail.colors.background = data.configMail?.colors?.background;
    }
    if (data.configMail?.colors?.title) {
      foundCompany.configMail.colors.title = data.configMail?.colors?.title;
    }
    if (data.configMail?.textBody) {
      foundCompany.configMail.textBody = data.configMail?.textBody;
    }
    if (data.pdf?.logo?.x) {
      foundCompany.configPdf.logo.x = data.pdf?.logo?.x;
    }
    if (data.pdf?.logo?.y) {
      foundCompany.configPdf.logo.y = data.pdf?.logo?.y;
    }
    if (data.pdf?.logo?.width) {
      foundCompany.configPdf.logo.width = data.pdf?.logo?.width;
    }
    if (data.pdf?.logoAlpha?.x) {
      foundCompany.configPdf.logoAlpha.x = data.pdf?.logoAlpha?.x;
    }
    if (data.pdf?.logoAlpha?.y) {
      foundCompany.configPdf.logoAlpha.y = data.pdf?.logoAlpha?.y;
    }
    if (data.pdf?.logoAlpha?.width) {
      foundCompany.configPdf.logoAlpha.width = data.pdf?.logoAlpha?.width;
    }
    if (data.pdf?.footer?.show !== undefined) {
      foundCompany.configPdf.footer.show = data.pdf?.footer?.show;
    }
    if (data.pdf?.footer?.text !== undefined) {
      foundCompany.configPdf.footer.text = data.pdf?.footer?.text;
    }
    if (data.pdf?.language !== undefined) {
      foundCompany.configPdf.language = data.pdf?.language;
    }
    if (data.correlatives?.manageInvoiceCorrelative !== undefined) {
      foundCompany.correlatives.manageInvoiceCorrelative = data.correlatives?.manageInvoiceCorrelative;
    }
    if (data.correlatives?.invoice) {
      foundCompany.correlatives.invoice = data.correlatives?.invoice;
    }

    await foundCompany.save();
    return {
      status: 200,
      message: "Config updated successfully",
    };
  } catch (e) {
    console.log("[ERROR] -> configCompany", e);
    return {
      status: 400,
      message: "An error occurred while updating the company",
      detail: e,
    };
  }
}

export async function uploadImage(id, imageType, file) {
  try {
    const foundCompany = await Company.findOne({
      _id: id,
    });
    switch (imageType) {
      case 'logo':
        removeImage(foundCompany.logo);
        foundCompany.logo = file.path;
        break;
      case 'logoAlpha':
        removeImage(foundCompany.logoAlpha);
        foundCompany.logoAlpha = file.path;
        break;
      case 'banner':
        removeImage(foundCompany.banner);
        foundCompany.banner = file.path;
        break;
    }
    await foundCompany.save();
    return {
      status: 200,
      message: file,
    };
  } catch (e) {
    console.log("[ERROR] -> uploadImage", e);
    return {
      status: 400,
      message: "An error occurred while updating the company",
      detail: e,
    };
  }
}

export async function deleteCompany(id) {
  try {
    const foundCompany = await Company.findOne({
      _id: id,
    });
    foundCompany.active = false;
    foundCompany.save();

    return { status: 200, message: "Company deleted" };
  } catch (e) {
    console.log("[ERROR] -> deleteCompany", e);
    return {
      status: 400,
      message: "An error occurred while deleting the company",
      detail: e,
    };
  }
}

export async function incrementCorrelative(company) {
  try {
    const foundCompany = await Company.findOne(company);
    if (!foundCompany) throw new Error();
    let newNumber = 1;
    if (foundCompany.correlatives?.invoice) {
      newNumber = foundCompany.correlatives.invoice + 1;
    }
    console.log('newNumber', newNumber);
    foundCompany.correlatives.invoice = newNumber;
    await foundCompany.save();
    return newNumber;
  } catch (e) {
    console.log(e);
    return 0;
  }
}

export async function getManageCorrelatives(company) {
  try {
    const foundCompany = await Company.findOne(company);
    if (!foundCompany) throw new Error();
    return foundCompany.correlatives.manageInvoiceCorrelative;
  } catch (error) {
    console.log(error);
    return true;
  }
}
