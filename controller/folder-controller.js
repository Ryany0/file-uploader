
import prisma from "../model/prisma.js";
import { format, formatISO } from "date-fns";
import { unlink } from "node:fs"

export async function getFolderPage(req,res) {

    res.locals.currentPath = req.path;

    const folders = await prisma.folder.findUnique({
        where: { route: req.path },
        select: {
            subFolders: true,
            id: true,
            route: true,
            files: true
        }
    });

    let subFolders = null;
    let files = null;
    if (folders) {
        req.session.currentFolderId = folders.id;
        req.session.currentFolderRoute = folders.route;

        if (folders.subFolders.length !== 0) {
            subFolders = folders.subFolders;
        }
        if (folders.files.length !== 0) {
            files = folders.files;
        }
    }


    res.render("folders-page", {folders: subFolders, files: files, format: format});
}

export async function createFolder(req,res) {
    if(!req.isAuthenticated()) {
        return res.status(401).redirect("/log-in");
    }
    const route = req.session.currentFolderRoute + "/" + req.body.name;
    const folder = await prisma.folder.create({
        data: {
            route: route,
            parentId: req.session.currentFolderId,
        }
    });

    res.redirect(req.session.currentFolderRoute);
}

export async function createFolderFromHome(req,res) {
    if(!req.isAuthenticated()) {
        return res.status(401).redirect("/log-in");
    }
    const route = req.path + req.body.name;

    const folder = await prisma.folder.create({
        data: {
            route: route,
            userId: req.user.id
        }
    });
    res.redirect("/");
}

export async function deleteFolder(req,res) {
    const folder = await prisma.folder.delete({
        where: {
            id: req.session.currentFolderId
        }
    });
    if (folder.parentId === null) {
        return res.redirect("/");
    }

    const parent = await prisma.folder.findUnique({
        where: {
            id: folder.parentId
        }
    });
    res.redirect(parent.route);
}

export async function uploadFile(req,res) {
    const time = formatISO(new Date);
    const file = await prisma.file.create({
        data: {
            name: req.file.originalname,
            path: req.file.path,
            filename: req.file.filename,
            size: req.file.size,
            upload: time,
            folderId: req.session.currentFolderId
        }
    });
    res.redirect(req.session.currentFolderRoute);
}

export async function deleteFile(req,res) {
    const file = await prisma.file.delete({
        where: {
            id: parseInt(req.body.fileId)
        }
    });
    unlink(file.path, (err) => {
        if (err) throw err;
    })
    res.redirect(req.session.currentFolderRoute);
}

export async function downloadFile(req,res) {
    console.log(req.body.fileId);
    const file = await prisma.file.findUnique({
        where: {
            id: parseInt(req.body.fileId)
        }
    });
    res.download(file.path, file.name, (err) => {
        if(err) {
            console.log("file download failed", err);
        }
    });
}