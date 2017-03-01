'use strict';

const path = require('path');
const loaderUtils = require('loader-utils');

const SvgDocument = require('./SvgDocument');
const SvgIcon = require('./SvgIcon');

/**
 * SVG Sprite
 */
class SvgSprite {

    /**
     * Initializes all sprite properties.
     * @param {string} resourcePath - the relative path for the sprite based on the output folder.
     */
    constructor(resourcePath) {
        const name = path.basename(resourcePath).match(/(?!\[[^[\]]*)\w+(?![^[\]]*])/)[0];

        const originalPathRegExp = resourcePath
            .replace(new RegExp('\\[', 'g'), '\\[')
            .replace(new RegExp('\\]', 'g'), '\\]');

        this.content = '';
        this.name = name;
        this.originalPath = resourcePath;
        this.originalPathRegExp = new RegExp(originalPathRegExp, 'gm');
        this.resourcePath = resourcePath;
        this.icons = {};
    }

    /**
     * Adds an icon to the sprite.
     * @param {string} resourcePath - the icon absolute path.
     * @param {string} prefix - the prefix to be prepended to the icon names.
     * @param {string} suffix - the suffix to be appended to the icon names.
     * @param {string} content - the icon content.
     * @returns {SvgIcon}
     */
    addIcon(resourcePath, prefix, suffix, content) {
        const icons = this.icons;

        if (!(resourcePath in icons)) {
            icons[resourcePath] = new SvgIcon(this, resourcePath, prefix, suffix, content);
        }

        return icons[resourcePath];
    }

    /**
     * Generates the sprite content based on the icons.
     * @return {string}
     */
    generate() {

        // Get sprite properties
        const { icons } = this;

        // Lists of symbols to be included in the sprite.
        let symbols = [];

        // For every icon in the sprite
        for (let iconPath in icons) {

            // Get the icon metadata
            const icon = icons[iconPath];

            // Create an SVG Document out of the icon contents
            const svg = icon.getDocument();

            // Create the icon <symbol/> and add it to the list of symbols
            symbols.push(svg.toSymbol(icon.symbolName));
        }

        // Generate the sprite content with the following format:
        // <svg>
        //   <defs>
        //       ...<symbol />
        //   </defs>
        // </svg>
        const content = SvgDocument.create(SvgDocument.createDefs(...symbols));

        // Generate interpolated name
        const resourcePath = loaderUtils.interpolateName({}, this.originalPath, { content });

        // Assign resource path and content to public values
        this.resourcePath = resourcePath;
        this.content = content;

        return content;
    }
}

module.exports = SvgSprite;
