
import NavigationButtons from '../../ui/NavigationButtons.jsx';

const Step3AdditionalInfo = ({
    formData,
    handleInputChange,
    setFormData,
    links,
    handleLinkChange,
    addLink,
    removeLink,
    showLinks,
    setShowLinks,
    showBirthdate,
    setShowBirthdate,
    expandedNotes,
    setExpandedNotes,
    errors,
    hasSubmitted,
    isLoading
}) => {
    return (
         
        <div className="space-y-6">
            {/* Optional: Links */}
          {!showLinks ? (
            <button
              type="button"
              onClick={() => setShowLinks(true)}
              className="flex items-center ml-1.5 space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight"
            >
              <span className="text-lg font-semibold">+</span>
              <span className="text-base text-black hover:text-red-500">links</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="relative text-red-500 left-2 tracking-wide font-extralight">links</p>
                <div className="flex gap-2">
                  <Button type="button" onClick={addLink} className="text-sm font-light text-red-500 hover:underline">
                    + add
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowLinks(false);
                      setLinks([{ title: '', url: '' }]);
                    }}
                    className="text-sm font-light text-gray-400 hover:text-red-500"
                  >
                    remove
                  </Button>
                </div>
              </div>
              {links.map((link, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                    placeholder="website"
                    className="w-[120px] rounded-xl border border-gray-400 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 rounded-xl border border-gray-400 bg-white p-2 text-black font-extralight text-sm focus:outline-none focus:border-red-500"
                  />
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="relative">
            <label
              htmlFor="notes"
              className="absolute -top-3 left-4 bg-white px-1 text-base text-black font-extralight"
            >
              important notes
            </label>
            <textarea
              name="notes"
              id="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="every thought matters.."
              disabled={isLoading}
              rows={expandedNotes ? 6 : 3}
              className="w-full rounded-xl border border-gray-400 bg-white hover:border-red-300 text-black font-extralight placeholder-gray-300 p-3 focus:outline-none focus:border-red-500"
              style={{ fontSize: '16px', fontWeight: 200 }}
            />
          </div>

          {/* Optional: Birthdate */}
          {!showBirthdate ? (
            <button
              type="button"
              onClick={() => setShowBirthdate(true)}
              className="flex items-center ml-1.5 space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200 font-extralight"
            >
              <span className="text-lg font-semibold">+</span>
              <span className="text-base text-black hover:text-red-500">birthdate</span>
            </button>
          ) : (
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="relative text-red-500 left-2 font-extralight">birthdate</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowBirthdate(false);
                    setFormData(prev => ({ ...prev, birthdate: '' }));
                  }}
                  className="text-red-500 hover:text-red-700 text-sm font-extralight"
                >
                  remove
                </button>
              </div>
              <input
                type="text"
                name="birthdate"
                id="birthdate"
                value={formData.birthdate}
                onChange={handleInputChange}
                placeholder="DD.MM.YYYY"
                disabled={isLoading}
                className={`w-full rounded-xl border bg-white hover:border-red-300 text-black font-extralight placeholder-gray-200 h-[48px] focus:outline-none focus:border-red-500 ${hasSubmitted && errors.birthdate ? 'border-red-500 shadow-md' : 'border-gray-400'
                  }`}
                style={{ fontSize: '16px', fontWeight: 200 }}
              />
              {hasSubmitted && errors.birthdate && (
                <p className="absolute top-full right-1 text-sm text-red-600 z-20 font-extralight">
                  {errors.birthdate}
                </p>
              )}
            </div>
          )}
        </div>
    );
};

export default Step3AdditionalInfo;